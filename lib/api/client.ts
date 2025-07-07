import axios, { AxiosError } from "axios";

// Config
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const TIMEOUT = 30000; // 30 seconds

const axiosInstance = axios.create({
	baseURL: API_URL,
	timeout: TIMEOUT,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // include cookies
});

function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("authjs.session-token") || null;
}

function setToken(token: string) {
	if (typeof window === "undefined") return;
	localStorage.setItem("authjs.session-token", token);
}

function clearToken() {
	if (typeof window === "undefined") return;
	localStorage.removeItem("authjs.session-token");
}

// request interceptor - add auth token
axiosInstance.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// response interceptor - handle errors
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		if (!error.response) {
			return Promise.reject({
				message: "Network error. Please check your connection.",
				code: "NETWORK_ERROR",
			});
		}

		// unauthorised
		if (error.response.status === 401) {
			clearToken();
			if (typeof window !== "undefined") {
				window.location.href = "/auth/login";
			}
			return Promise.reject({
				message: "Unauthorized. Please login again.",
				code: "UNAUTHORIZED",
			});
		}

		// server error
		const msg =
			(error.response.data as any)?.message || "Something went wrong.";
		return Promise.reject({
			message: msg,
			status: error.response.status,
		});
	}
);

// helper functions
export function getErrorMessage(error: any): string {
	return error?.message || "Something went wrong.";
}

// api methods
export const api = {
	get: async <T>(url: string): Promise<T> => {
		const { data } = await axiosInstance.get<T>(url);
		return data;
	},
	post: async <T>(url: string, body?: any): Promise<T> => {
		const { data } = await axiosInstance.post<T>(url, body);
		return data;
	},
	patch: async <T>(url: string, body?: any): Promise<T> => {
		const { data } = await axiosInstance.patch<T>(url, body);
		return data;
	},
	delete: async <T>(url: string): Promise<T> => {
		const { data } = await axiosInstance.delete<T>(url);
		return data;
	},
	upload: async <T>(url: string, file: File): Promise<T> => {
		const formData = new FormData();
		formData.append("file", file);

		const { data } = await axiosInstance.post<T>(url, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return data;
	},
};

export { setToken, clearToken, getToken };
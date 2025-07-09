"use client";

import { useEffect, useState } from "react";
import { ApiKeyData, ApiKeyState } from "@/lib/types/settings";
import { toast } from "sonner";

const providers = [
	{ id: "openai", name: "OpenAI" },
	{ id: "anthropic", name: "Anthropic" },
	{ id: "google", name: "Google AI" },
];

export const useApiKeys = () => {
	const [apiKeys, setApiKeys] = useState<ApiKeyState[]>(
		providers.map((provider) => ({
			id: provider.id,
			provider: provider.name as "openai" | "google" | "anthropic",
			key: "",
			isEditing: false,
			status: "none",
			isLoading: false,
			isVerifying: false,
			isDeleting: false,
			isSaving: false,
		}))
	);
	const [isInitialLoading, setIsInitialLoading] = useState(false);

	const generateMaskedKey = (provider: string) => {
		const patterns = {
			openai: "sk-••••••••••••••••••••••••••••••••••••••••••••••••",
			anthropic:
				"sk-ant-••••••••••••••••••••••••••••••••••••••••••••••••",
			google: "AIza••••••••••••••••••••••••••••••••••••",
		};
		return (
			patterns[provider as keyof typeof patterns] ||
			"••••••••••••••••••••••••••••••••••••••••"
		);
	};

	const loadApiKeys = async () => {
		try {
			setIsInitialLoading(true);
			const res = await fetch("/api/keys");

			if (!res.ok) {
				throw new Error("Failed to fetch API keys");
			}

			const data = await res.json();
			const serverApiKeys: ApiKeyData[] = data.apiKeys || [];

			setApiKeys((prev) =>
				prev.map((key) => {
					const serverApiKey = serverApiKeys.find(
						(sk) => sk.provider === key.id
					);
					return {
						...key,
						status: serverApiKey
							? serverApiKey.isValidated
								? "verified"
								: "invalid"
							: "none",
					};
				})
			);
		} catch (error) {
			console.error("Error loading API keys:", error);
		} finally {
			setIsInitialLoading(false);
		}
	};

	const loadApiKeyForEdit = async (providerId: string) => {
		try {
			setApiKeys((prev) =>
				prev.map((key) =>
					key.id === providerId ? { ...key, isLoading: true } : key
				)
			);

			const res = await fetch(`/api/keys/${providerId}`);
			if (!res.ok) {
				throw new Error("Failed to fetch API key");
			}

			const data = await res.json();
			if (data.hasValidKey) {
				const apiKeyResponse = await fetch(
					`/api/keys/${providerId}/decrypt`
				);
				if (!apiKeyResponse.ok) {
					throw new Error("Failed to decrypt API key");
				}

				const apiKeyData = await apiKeyResponse.json();
				setApiKeys((prev) =>
					prev.map((key) =>
						key.id === providerId
							? {
									...key,
									key: apiKeyData.apiKey || "",
									isLoading: false,
									isEditing: true,
							  }
							: key
					)
				);
				return;
			}

			// If no valid key, set to none and reset editing state
			setApiKeys((prev) =>
				prev.map((key) =>
					key.id === providerId
						? { ...key, isLoading: false, isEditing: false }
						: key
				)
			);
		} catch (error) {
			console.error("Error loading API key for edit:", error);
			setApiKeys((prev) =>
				prev.map((key) =>
					key.id === providerId
						? { ...key, isLoading: false, isEditing: true, key: "" }
						: key
				)
			);
		}
	};

	const toggleEdit = (providerId: string) => {
		console.log("trying to toggle edit");
		const apiKey = apiKeys.find((key) => key.id === providerId);
		console.log("apiKey", apiKey);

		if (apiKey?.isEditing && apiKey.status === "verified") {
			console.log("if");
			loadApiKeyForEdit(providerId);
		} else {
			console.log("else");
			setApiKeys((prev) =>
				prev.map((key) =>
					key.id === providerId
						? { ...key, isEditing: !key.isEditing }
						: key
				)
			);
			console.log("key.isEditing", apiKey?.isEditing);
		}
	};

	const handleInputChange = (providerId: string, value: string) => {
		setApiKeys((prev) =>
			prev.map((key) =>
				key.id === providerId ? { ...key, key: value } : key
			)
		);
	};

	const saveKey = async (providerId: string) => {
		const apiKey = apiKeys.find((key) => key.id === providerId);
		if (!apiKey?.key.trim()) return;

		try {
			setApiKeys((prev) =>
				prev.map((key) =>
					key.id === providerId ? { ...key, isSaving: true } : key
				)
			);

			const res = await fetch("/api/keys", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					provider: providerId,
					apiKey: apiKey.key,
				}),
			});
			const data = await res.json();

			if (!res.ok) {
				setApiKeys((prev) =>
					prev.map((key) =>
						key.id === providerId
							? { ...key, status: "invalid", isSaving: false }
							: key
					)
				);
				toast.error(data.error);
				console.error("Failed to save API key", data.error);
			} else {
				setApiKeys((prev) =>
					prev.map((key) =>
						key.id === providerId
							? {
									...key,
									status: "verified",
									isSaving: false,
									isEditing: false,
									key: "", // reset key after saving
							  }
							: key
					)
				);
				toast.success("API key saved successfully");
			}
		} catch (error) {
			console.error("Error saving API key:", error);
			setApiKeys((prev) =>
				prev.map((key) =>
					key.id === providerId
						? { ...key, status: "invalid", isSaving: false }
						: key
				)
			);
		}
	};

	const cancelEdit = (providerId: string) => {
		setApiKeys((prev) =>
			prev.map((key) =>
				key.id === providerId
					? { ...key, isEditing: false, key: "" }
					: key
			)
		);
	};

	// Load API keys on component mount
	useEffect(() => {
		loadApiKeys();
	}, []);

	return {
		apiKeys,
		isInitialLoading,
		generateMaskedKey,
		loadApiKeys,
		toggleEdit,
		handleInputChange,
		saveKey,
		cancelEdit,
	};
};

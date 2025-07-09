import { api } from "./client";
import { Message } from "@/lib/types/chat";
import { SidebarChat, SidebarChatResponse } from "@/lib/types/sidebar";

export const endpoints = {
	// Chats endpoints
	chats: {
		// GET /chats - List all chats with pagination
		list: async (params: { limit: number; offset: number }) => {
			return api.get<SidebarChatResponse>(
				`/chats?limit=${params.limit}&offset=${params.offset}`,
			);
		},

		// POST /chats - Create a new chat
		create: async (data: { initialMessage: string; model?: string }) => {
			return api.post<{ chatId: string; chat: SidebarChat }>(
				"/chats",
				data,
			);
		},

		// PATCH /chats/:chatId => update a chat (rename or star/unstar)
		update: async (
			chatId: string,
			action: "rename" | "toggle_star",
			data?: { title?: string },
		) => {
			return api.patch<SidebarChat>(`/chats/${chatId}`, {
				action,
				...(data || {}),
			});
		},

		// DELETE /chats/:chatId => delete a chat
		delete: async (chatId: string) => {
			return api.delete(`/chats/${chatId}`);
		},

		// Separate convenience methods for clarity
		rename: async (chatId: string, title: string) => {
			return endpoints.chats.update(chatId, "rename", { title });
		},

		toggleStar: async (chatId: string) => {
			return endpoints.chats.update(chatId, "toggle_star");
		},
	},
	// Messages endpoints
	messages: {
		// GET /chats/:chatId/messages => get all messages for a chat
		get: async (chatId: string) => {
			return api.get<Message[]>(`/chats/${chatId}/messages`);
		},

		// POST /api/chats/:chatId/messages - Send message & get AI response (streaming)
		send: async (chatId: string, message: string, model: string) => {
			// Use fetch directly for streaming instead of axios
			const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

			const response = await fetch(
				`${API_URL}/chats/${chatId}/messages`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						// Add auth header if needed
						...(typeof window !== "undefined" &&
						localStorage.getItem("authjs.session-token")
							? {
									Authorization: `Bearer ${localStorage.getItem("authjs.session-token")}`,
								}
							: {}),
					},
					credentials: "include",
					body: JSON.stringify({
						message,
						model,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			if (!response.body) {
				throw new Error("No response body");
			}

			return response.body;
		},
	},
};

/*
GET /chats => list all chats without messages
POST /chats => create a new chat

PATCH /chats/:id => update a chat (rename, star, etc.)
DELETE /chats/:id => delete a chat

GET /chats/:id/messages => get all messages for a chat
POST /chats/:id/messages => send a message to a chat

// Later things
PATCH /chats/:id/messages => update a message (pass messageId in body)
DELETE /chats/:id/messages => delete a message (pass messageId in body)

POST /chats/:id/generate-title => generate a title for a chat
*/

// lib/api/endpoints.ts
// import { api } from './client';
// import {
//   SidebarChat,
//   SidebarChatResponse,
//   ChatMessage,
//   User,
//   Settings
// } from '@/lib/types';

// export const endpoints = {
//   // Chat endpoints
//   chats: {
//     // List all chats with pagination
//     list: async (params: { limit: number; offset: number }) => {
//       const response = await api.get<SidebarChatResponse>(
//         `/chats?limit=${params.limit}&offset=${params.offset}`
//       );
//       return response;
//     },

//     // Get single chat with messages
//     get: async (id: string) => {
//       return api.get<{
//         chat: SidebarChat;
//         messages: ChatMessage[];
//       }>(`/chats/${id}`);
//     },

//     // Create new chat
//     create: async (data: {
//       message: string;
//       model?: string;
//     }) => {
//       return api.post<{ id: string; chat: SidebarChat }>('/chats', data);
//     },

//     // Update chat (for renaming, starring, etc.)
//     update: async (id: string, data: Partial<SidebarChat>) => {
//       return api.put<SidebarChat>(`/chats/${id}`, data);
//     },

//     // Delete chat
//     delete: async (id: string) => {
//       return api.delete(`/chats/${id}`);
//     },

//     // Star/unstar chat
//     toggleStar: async (id: string, starred: boolean) => {
//       return api.put<SidebarChat>(`/chats/${id}/star`, { starred });
//     },

//     // Generate AI title for chat
//     generateTitle: async (id: string, userMessage: string) => {
//       return api.post<{ title: string }>(`/chats/${id}/generate-title`, {
//         userMessage
//       });
//     },
//   },

//   // Message endpoints
//   messages: {
//     // Send message to chat
//     send: async (chatId: string, content: string) => {
//       return api.post<ChatMessage>(`/chats/${chatId}/messages`, {
//         content,
//         role: 'user'
//       });
//     },

//     // Get AI response (streaming)
//     streamResponse: async (chatId: string, messages: ChatMessage[]) => {
//       // For streaming, return the raw response
//       return fetch('/api/ai/stream', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify({ chatId, messages }),
//       });
//     },

//     // Update message
//     update: async (chatId: string, messageId: string, content: string) => {
//       return api.put<ChatMessage>(
//         `/chats/${chatId}/messages/${messageId}`,
//         { content }
//       );
//     },

//     // Delete message
//     delete: async (chatId: string, messageId: string) => {
//       return api.delete(`/chats/${chatId}/messages/${messageId}`);
//     },
//   },

//   // User/Settings endpoints
//   user: {
//     // Get current user profile
//     profile: async () => {
//       return api.get<User>('/user/profile');
//     },

//     // Update profile
//     updateProfile: async (data: Partial<User>) => {
//       return api.put<User>('/user/profile', data);
//     },

//     // Update API keys
//     updateApiKeys: async (keys: Record<string, string>) => {
//       return api.put('/user/api-keys', { keys });
//     },
//   },

//   // Settings endpoints
//   settings: {
//     // Get all settings
//     get: async () => {
//       return api.get<Settings>('/settings');
//     },

//     // Update appearance settings
//     updateAppearance: async (appearance: any) => {
//       return api.put('/settings/appearance', appearance);
//     },

//     // Update model preferences
//     updateModels: async (models: any) => {
//       return api.put('/settings/models', models);
//     },

//     // Get available tools
//     getTools: async () => {
//       return api.get('/settings/tools');
//     },

//     // Update tool settings
//     updateTools: async (tools: any) => {
//       return api.put('/settings/tools', tools);
//     },
//   },

//   // Auth endpoints (if needed)
//   auth: {
//     login: async (credentials: { email: string; password: string }) => {
//       return api.post<{ token: string; user: User }>('/auth/login', credentials);
//     },

//     logout: async () => {
//       return api.post('/auth/logout');
//     },

//     register: async (data: {
//       email: string;
//       password: string;
//       name: string;
//     }) => {
//       return api.post<{ token: string; user: User }>('/auth/register', data);
//     },

//     refreshToken: async () => {
//       return api.post<{ token: string }>('/auth/refresh');
//     },
//   },
// };

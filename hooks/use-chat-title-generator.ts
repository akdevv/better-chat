"use client";

import { useState, useCallback } from "react";

interface UseChatTitleGeneratorReturn {
	generateTitle: (chatId: string, userMessage: string) => Promise<void>;
	isGenerating: boolean;
	error: string | null;
}

export function useChatTitleGenerator(): UseChatTitleGeneratorReturn {
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const generateTitle = useCallback(
		async (chatId: string, userMessage: string) => {
			if (!chatId || !userMessage?.trim()) {
				console.log("❌ Invalid inputs for title generation");
				return;
			}

			setIsGenerating(true);
			setError(null);

			try {
				console.log("🎯 Generating title for chat:", chatId);
				console.log("📝 User message:", userMessage);

				const res = await fetch(`/api/chats/${chatId}/generate-title`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userMessage: userMessage.trim(),
						timestamp: new Date().toISOString(),
					}),
				});

				if (!res.ok) {
					throw new Error(`Failed to generate title: ${res.status}`);
				}

				const result = await res.json();
				console.log("✅ Title generation res:", result);

				if (result.success && result.title) {
					console.log(
						"📡 Emitting title update event:",
						result.title
					);

					// Dispatch custom event for sidebar to listen
					window.dispatchEvent(
						new CustomEvent("chatTitleUpdated", {
							detail: {
								chatId,
								title: result.title,
							},
						})
					);

					console.log(
						"✅ Title update event dispatched successfully"
					);
				} else {
					console.log(
						"⚠️ Title generation was not successful:",
						result.error
					);
					setError(result.error || "Failed to generate title");
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				console.error("❌ Error generating chat title:", errorMessage);
				setError(errorMessage);
			} finally {
				setIsGenerating(false);
			}
		},
		[]
	);

	return {
		generateTitle,
		isGenerating,
		error,
	};
}

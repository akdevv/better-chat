"use client";

import { Message } from "@/lib/types/chat";
import { AI_MODELS } from "@/lib/ai/models";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function ChatBubble({
	messages,
	scrollAreaRef,
	messagesEndRef,
}: {
	messages: Message[];
	scrollAreaRef: React.RefObject<HTMLDivElement | null>;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const getModelName = (modelId: string) => {
		const model = AI_MODELS.find((m) => m.id === modelId);
		return model ? model.name : modelId;
	};

	const copyToClipboard = async (content: string, messageId: string) => {
		try {
			await navigator.clipboard.writeText(content);
			setCopiedId(messageId);
			setTimeout(() => setCopiedId(null), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<div
			ref={scrollAreaRef}
			className="p-4 max-w-4xl mx-auto w-full min-h-full space-y-6"
		>
			{messages.map((message) => {
				console.log("message", message);
				const isUserMessage = message.role === "USER";
				return (
					<div
						key={message.id}
						className={`flex ${
							isUserMessage ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`max-w-[80%] ${
								isUserMessage ? "flex flex-col items-end" : ""
							}`}
						>
							{/* Message Content */}
							<div
								className={`${
									isUserMessage
										? "bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl rounded-br-md"
										: "text-foreground"
								}`}
							>
								<div className="whitespace-pre-wrap leading-relaxed">
									{message.content}
								</div>
							</div>

							{/* Model Details and Copy Button for AI Messages */}
							{!isUserMessage && (
								<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
									<span>{getModelName(message.model)}</span>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 w-6 p-0 hover:bg-muted"
										onClick={() =>
											copyToClipboard(
												message.content,
												message.id
											)
										}
									>
										{copiedId === message.id ? (
											<Check className="h-3 w-3" />
										) : (
											<Copy className="h-3 w-3" />
										)}
									</Button>
								</div>
							)}
						</div>
					</div>
				);
			})}
			<div ref={messagesEndRef} />
		</div>
	);
}

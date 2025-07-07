"use client";

import { useState } from "react";
import { Message } from "@/lib/types/chat";
import { AI_MODELS } from "@/lib/ai/models";

import { Button } from "@/components/ui/button";
import { PiBrain } from "react-icons/pi";
import { FiCopy, FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";

interface ContentPart {
	type: "thinking" | "content";
	content: string;
}

export function ChatBubble({
	messages,
	// scrollAreaRef,
	// messagesEndRef,
	isWaitingForResponse,
}: {
	messages: Message[];
	// scrollAreaRef: React.RefObject<HTMLDivElement | null>;
	// messagesEndRef: React.RefObject<HTMLDivElement | null>;
	isWaitingForResponse?: boolean;
}) {
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [expandedThinking, setExpandedThinking] = useState<{
		[messageId: string]: boolean;
	}>({});

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

	const formatContent = (content: string): ContentPart[] => {
		// Regex to match <think>...</think> tags with multiline support
		const thinkRegex = /<think>([\s\S]*?)<\/think>/gi;
		const parts: ContentPart[] = [];
		let lastIndex = 0;
		let match;

		// Find all thinking blocks
		while ((match = thinkRegex.exec(content)) !== null) {
			// Add content before the thinking block
			if (match.index > lastIndex) {
				const beforeContent = content
					.slice(lastIndex, match.index)
					.trim();
				if (beforeContent) {
					parts.push({ type: "content", content: beforeContent });
				}
			}

			// Add the thinking block if it has content
			const thinkingContent = match[1].trim();
			if (thinkingContent) {
				parts.push({ type: "thinking", content: thinkingContent });
			}

			lastIndex = match.index + match[0].length;
		}

		// Add remaining content after the last thinking block
		if (lastIndex < content.length) {
			const remainingContent = content.slice(lastIndex).trim();
			if (remainingContent) {
				parts.push({ type: "content", content: remainingContent });
			}
		}

		// If no thinking blocks were found, return the original content
		if (parts.length === 0) {
			parts.push({ type: "content", content: content });
		}

		return parts;
	};

	const toggleThinking = (messageId: string) => {
		setExpandedThinking((prev) => ({
			...prev,
			[messageId]: !prev[messageId],
		}));
	};

	return (
		<div
			// ref={scrollAreaRef}
			className="p-4 max-w-3xl mx-auto w-full min-h-full space-y-6"
		>
			{messages.map((message) => {
				const isUserMessage = message.role === "USER";
				const isThinkingExpanded =
					expandedThinking[message.id] || false;

				return (
					<div
						key={message.id}
						className={`flex ${
							isUserMessage ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`${
								isUserMessage
									? "flex flex-col items-end max-w-[80%]"
									: "w-full"
							}`}
						>
							{/* Message Content */}
							<div
								className={`${
									isUserMessage
										? "bg-secondary text-secondary-foreground px-4 py-3 rounded-3xl"
										: "text-foreground"
								}`}
							>
								<div className="whitespace-pre-wrap leading-relaxed">
									{isUserMessage ? (
										message.content
									) : (
										<div className="space-y-4">
											{formatContent(message.content).map(
												(part, partIndex) => (
													<div key={partIndex}>
														{part.type ===
														"thinking" ? (
															<div className="mb-4">
																<button
																	onClick={() =>
																		toggleThinking(
																			message.id
																		)
																	}
																	className="group w-full flex items-center justify-between p-3 bg-muted/15 hover:bg-muted/25 transition-all duration-200 rounded-lg border border-transparent hover:border-muted/30"
																>
																	<div className="flex items-center gap-2.5">
																		<div className="w-5 h-5 rounded-md bg-muted/30 flex items-center justify-center">
																			<PiBrain className="w-3 h-3 text-muted-foreground/70" />
																		</div>
																		<span className="text-xs font-medium text-muted-foreground/70">
																			Thinking
																		</span>
																	</div>
																	{isThinkingExpanded ? (
																		<FiChevronUp className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors" />
																	) : (
																		<FiChevronDown className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors" />
																	)}
																</button>
																{isThinkingExpanded && (
																	<div className="mt-2 p-3 bg-muted/8 rounded-lg border-l-2 border-muted/25">
																		<MarkdownRenderer
																			content={
																				part.content
																			}
																			className="text-xs text-muted-foreground/75 prose-sm max-w-none [&>*]:my-1.5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
																		/>
																	</div>
																)}
															</div>
														) : (
															<MarkdownRenderer
																content={
																	part.content
																}
																className="text-sm leading-relaxed prose max-w-none dark:prose-invert"
															/>
														)}
													</div>
												)
											)}
										</div>
									)}
								</div>
							</div>

							{/* Model Details and Copy Button */}
							{!isUserMessage && (
								<div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
									<span>{getModelName(message.model)}</span>
									<Button
										variant="ghost"
										size="sm"
										className="h-4 w-4 p-0 hover:bg-transparent cursor-pointer"
										onClick={() =>
											copyToClipboard(
												message.content,
												message.id
											)
										}
									>
										{copiedId === message.id ? (
											<FiCheck className="h-2 w-2" />
										) : (
											<FiCopy className="h-2 w-2" />
										)}
									</Button>
								</div>
							)}
						</div>
					</div>
				);
			})}

			{/* Loading indicator when waiting for AI response */}
			{isWaitingForResponse && (
				<div className="flex justify-start mb-6">
					<div className="flex items-center gap-3 px-4 py-3 bg-muted/20 rounded-xl border border-border/30">
						<PiBrain className="h-4 w-4 text-muted-foreground animate-pulse" />
						<div className="flex items-center gap-1">
							<div
								className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
								style={{
									animationDelay: "0ms",
									animationDuration: "1.4s",
								}}
							></div>
							<div
								className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
								style={{
									animationDelay: "200ms",
									animationDuration: "1.4s",
								}}
							></div>
							<div
								className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
								style={{
									animationDelay: "400ms",
									animationDuration: "1.4s",
								}}
							></div>
						</div>
					</div>
				</div>
			)}

			{/* <div ref={messagesEndRef} /> */}
		</div>
	);
}

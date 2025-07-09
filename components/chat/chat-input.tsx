"use client";

import { useRef, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowUpLong } from "react-icons/fa6";
import { FaRegCircleStop } from "react-icons/fa6";
import { ModelSelector } from "./model-selector";
import { AnimatedBackground } from "./animated-bg";
import { Spinner } from "@/components/shared/spinner";

import { useChatContext } from "@/contexts/chat-context";

export const ChatInput = memo(
	({
		onSendMessage,
		maxHeight = 120,
	}: {
		onSendMessage: (e: React.FormEvent) => void;
		maxHeight?: number;
	}) => {
		const {
			input,
			selectedModel,
			isCreatingChat,
			chatState,
			setInput,
			setSelectedModel,
			onCancel,
		} = useChatContext();

		const textareaRef = useRef<HTMLTextAreaElement>(null);

		// Auto-resize textarea
		const adjustTextareaHeight = useCallback(() => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			textarea.style.height = "auto";
			const newHeight = Math.min(textarea.scrollHeight, maxHeight);
			textarea.style.height = `${newHeight}px`;
		}, []);

		useEffect(() => {
			adjustTextareaHeight();
		}, [input, adjustTextareaHeight]);

		// Handle keyboard shortcuts
		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
				// Send on Enter (without Shift)
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					onSendMessage(e as any);
				}

				// Cancel on Escape
				if (e.key === "Escape" && onCancel) {
					e.preventDefault();
					onCancel();
				}
			},
			[onSendMessage, onCancel],
		);

		return (
			<div className="max-w-3xl mx-auto w-full">
				{/* Outer container */}
				<div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl relative overflow-hidden border border-border/40 shadow-lg bg-card/20 backdrop-blur-md group">
					<AnimatedBackground />

					{/* Content Container */}
					<div className="relative z-10 bg-card/90 backdrop-blur-xl border border-border/70 rounded-lg sm:rounded-xl group-hover:backdrop-blur-2xl group-hover:bg-card transition-all duration-500">
						<form onSubmit={onSendMessage} className="p-2 sm:p-3">
							{/* Input section */}
							<div className="mb-2 sm:mb-3">
								<textarea
									ref={textareaRef}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder={"Ask me anything..."}
									disabled={isCreatingChat}
									rows={1}
									className="w-full min-h-[40px] sm:min-h-[44px] md:min-h-[48px] px-2 sm:px-3 py-2 sm:py-3 resize-none border-0 bg-transparent focus:outline-none focus:ring-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
									style={{ resize: "none" }}
									onKeyDown={handleKeyDown}
								/>
							</div>

							{/* Controls section */}
							<div className="flex items-center justify-between gap-2 sm:gap-3 pt-2">
								{/* Model selector */}
								<div className="flex items-center">
									<ModelSelector
										value={selectedModel}
										onValueChange={setSelectedModel}
										disabled={isCreatingChat}
									/>
								</div>

								{/* Actions Button */}
								<div className="flex items-center gap-1 sm:gap-2 ml-auto">
									{/* Cancel button */}
									{/* {isLoading && onCancel && (
									<Button
										type="button"
										size="sm"
										onClick={onCancel}
										className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md sm:rounded-lg transition-all duration-200 cursor-pointer"
									>
										<FaRegCircleStop className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
										<span className="sr-only">
											Stop generating
										</span>
									</Button>
								)} */}

									<Button
										type="submit"
										size="sm"
										disabled={
											!input.trim() || isCreatingChat
										}
										className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md sm:rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
									>
										{isCreatingChat ? (
											<Spinner size="sm" color="dark" />
										) : (
											<>
												<FaArrowUpLong className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
												<span className="sr-only">
													Send message
												</span>
											</>
										)}
									</Button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	},
);

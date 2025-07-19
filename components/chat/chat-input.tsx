"use client";

import { useRef, useEffect, useCallback, memo } from "react";
import { useChatContext } from "@/contexts/chat-context";
import { useFileUpload } from "@/hooks/use-file-upload";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FaArrowUpLong } from "react-icons/fa6";
import { FaRegCircleStop } from "react-icons/fa6";
import { ModelSelector } from "./model-selector";
import { AnimatedBackground } from "./animated-bg";
import { Spinner } from "@/components/shared/spinner";

import { FileUploadButton } from "./file-upload-button";
import { DragDropZone } from "./drag-drop-zone";
import { InputFilePreview } from "./input-file-preview";

export const ChatInput = memo(({ maxHeight = 120 }: { maxHeight?: number }) => {
	const {
		input,
		selectedModel,
		isCreatingChat,
		chatState,
		setInput,
		setSelectedModel,
		handleCreateChat,
		handleSendMessage,
		onCancel,
		onStop,
	} = useChatContext();

	const {
		attachedFiles,
		handleFilesSelected,
		handleRemoveFile,
		clearFiles,
		linkFilesToMessage,
		getUploadedFileIds,
		logAttachedFiles,
	} = useFileUpload();

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const pathname = usePathname();

	// Determine which send handler to use based on route
	const isChatIdPage = /^\/chat\/[^/]+$/.test(pathname || "");
	const onSendMessage = isChatIdPage ? handleSendMessage : handleCreateChat;

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

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			const hasContent = input.trim() || attachedFiles.length > 0;
			const uploadedFileIds = getUploadedFileIds();

			if (!hasContent) return;

			// Log attached files if any
			if (attachedFiles.length > 0) {
				logAttachedFiles();
			}

			// Create file upload callback
			const onFilesLinked = async (chatId: string, messageId: string) => {
				if (attachedFiles.length > 0) {
					console.log(`→ Uploading files for message ${messageId}`);
					const success = await linkFilesToMessage(chatId, messageId);
					if (!success) {
						throw new Error("File upload failed");
					}
				}
			};

			try {
				await onSendMessage(e, uploadedFileIds, onFilesLinked);
				clearFiles();
			} catch (error) {
				console.error("Failed to send message:", error);
			}
		},
		[
			input,
			attachedFiles,
			getUploadedFileIds,
			logAttachedFiles,
			linkFilesToMessage,
			onSendMessage,
			clearFiles,
		]
	);

	// Handle keyboard shortcuts
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			// Send on Enter (without Shift)
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSubmit(e as any);
			}

			// Cancel on Escape
			if (e.key === "Escape" && onCancel) {
				e.preventDefault();
				onCancel();
			}
		},
		[handleSubmit, onCancel]
	);

	const hasContent = input.trim() || attachedFiles.length > 0;

	return (
		<DragDropZone
			onFilesDropped={handleFilesSelected}
			disabled={isCreatingChat}
		>
			<div className="max-w-3xl mx-auto w-full">
				{/* Outer container */}
				<div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl relative border border-border/40 shadow-lg bg-card/20 backdrop-blur-md group">
					<AnimatedBackground />

					{/* Content Container */}
					<div className="relative z-10 bg-card/90 backdrop-blur-xl border border-border/70 rounded-lg sm:rounded-xl group-hover:backdrop-blur-2xl group-hover:bg-card transition-all duration-500">
						<form onSubmit={handleSubmit} className="p-2 sm:p-3">
							{/* File preview section */}
							{attachedFiles.length > 0 && (
								<div className="mb-2 sm:mb-3">
									<InputFilePreview
										files={attachedFiles}
										onRemoveFile={handleRemoveFile}
									/>
								</div>
							)}

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
								<div className="flex items-center gap-1">
									<FileUploadButton
										onFilesSelected={handleFilesSelected}
										disabled={isCreatingChat}
									/>
									<ModelSelector
										value={selectedModel}
										onValueChange={setSelectedModel}
										disabled={isCreatingChat}
									/>
								</div>

								{/* Actions Button */}
								<div className="flex items-center gap-1 sm:gap-2 ml-auto">
									<Button
										type={
											chatState.isStreamingResponse
												? "button"
												: "submit"
										}
										size="sm"
										onClick={
											chatState.isStreamingResponse
												? onStop
												: undefined
										}
										disabled={
											(!hasContent &&
												!chatState.isStreamingResponse) ||
											isCreatingChat
										}
										className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md sm:rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
									>
										{isCreatingChat ? (
											<Spinner size="sm" color="dark" />
										) : chatState.isStreamingResponse ? (
											<>
												<FaRegCircleStop className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
												<span className="sr-only">
													Stop generating
												</span>
											</>
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
		</DragDropZone>
	);
});

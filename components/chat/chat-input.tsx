"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ModelSelector from "@/components/chat/model-selector";
import { FaArrowUpLong } from "react-icons/fa6";

interface ChatInputProps {
	input: string;
	setInput: (value: string) => void;
	isLoading: boolean;
	selectedModel: string;
	setSelectedModel: (value: string) => void;
	onSendMessage: (e: React.FormEvent) => void;
}

export function ChatInput({
	input,
	setInput,
	isLoading,
	selectedModel,
	setSelectedModel,
	onSendMessage,
}: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
		}
	}, [input]);

	return (
		<div className="w-full">
			<div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
				<div>
					{/* Outer container with gradient background */}
					<div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl relative overflow-hidden border border-border/40 shadow-lg bg-card/20 backdrop-blur-md group">
						{/* Gradient background elements */}
						<div className="absolute inset-0 z-0 transition-all duration-700">
							{/* Animated mesh gradient background */}
							<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/8 via-purple-500/6 to-emerald-500/8 opacity-80"></div>

							{/* Multiple random orbs filling the background - scaled for mobile */}
							{/* Large orbs */}
							<div className="absolute -top-12 sm:-top-16 -left-12 sm:-left-16 w-36 sm:w-48 h-36 sm:h-48 bg-gradient-to-br from-violet-500/35 via-purple-600/25 to-indigo-500/20 rounded-full filter blur-xl sm:blur-2xl transition-all duration-1000"></div>
							<div className="absolute -bottom-16 sm:-bottom-20 -right-8 sm:-right-12 w-42 sm:w-56 h-42 sm:h-56 bg-gradient-to-tl from-rose-500/30 via-pink-500/25 to-orange-400/20 rounded-full filter blur-xl sm:blur-2xl transition-all duration-1000"></div>
							<div className="absolute top-1/3 right-1/3 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-r from-emerald-500/28 via-teal-400/20 to-cyan-400/25 rounded-full filter blur-lg sm:blur-xl transition-all duration-1000"></div>

							{/* Medium orbs */}
							<div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-bl from-amber-400/25 via-yellow-500/18 to-orange-500/15 rounded-full filter blur-lg sm:blur-xl transition-all duration-1000"></div>
							<div className="absolute bottom-0 left-1/4 w-28 sm:w-36 h-28 sm:h-36 bg-gradient-to-tr from-blue-400/30 via-indigo-400/20 to-purple-400/18 rounded-full filter blur-lg sm:blur-xl transition-all duration-1000"></div>
							<div className="absolute top-1/2 left-0 w-20 sm:w-28 h-20 sm:h-28 bg-gradient-to-r from-green-400/25 via-emerald-400/18 to-teal-400/15 rounded-full filter blur-md sm:blur-lg transition-all duration-1000"></div>
							<div className="absolute top-1/4 right-1/4 w-18 sm:w-24 h-18 sm:h-24 bg-gradient-to-bl from-fuchsia-400/22 via-pink-400/18 to-rose-400/15 rounded-full filter blur-md sm:blur-lg transition-all duration-1000"></div>

							{/* Small orbs - hidden on very small screens */}
							<div className="hidden xs:block absolute top-3/4 right-1/6 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-t from-slate-400/20 via-gray-400/15 to-zinc-400/12 rounded-full filter blur-md sm:blur-lg transition-all duration-1000"></div>
							<div className="hidden xs:block absolute bottom-1/4 right-2/3 w-14 sm:w-18 h-14 sm:h-18 bg-gradient-to-br from-red-400/18 via-orange-400/15 to-yellow-400/12 rounded-full filter blur-sm sm:blur-md transition-all duration-1000"></div>
							<div className="hidden xs:block absolute top-1/6 left-1/3 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-tl from-sky-400/20 via-blue-400/15 to-indigo-400/12 rounded-full filter blur-sm sm:blur-md transition-all duration-1000"></div>

							{/* Tiny floating particles - scaled for mobile */}
							<div className="absolute top-3 sm:top-4 left-1/4 w-2 sm:w-3 h-2 sm:h-3 bg-violet-400/50 rounded-full filter blur-sm animate-pulse"></div>
							<div className="absolute bottom-4 sm:bottom-6 right-1/4 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-rose-400/60 rounded-full filter blur-sm animate-pulse delay-300"></div>
							<div className="absolute top-1/2 left-1/6 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-400/70 rounded-full filter blur-sm animate-pulse delay-700"></div>
							<div className="absolute top-2/3 right-1/5 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-amber-400/60 rounded-full filter blur-sm animate-pulse delay-500"></div>
							<div className="absolute bottom-1/3 left-1/5 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-400/55 rounded-full filter blur-sm animate-pulse delay-1000"></div>
							<div className="absolute top-1/5 right-2/5 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-fuchsia-400/65 rounded-full filter blur-sm animate-pulse delay-200"></div>
						</div>

						{/* Content container with enhanced glassy effect */}
						<div className="relative z-10 bg-card/80 backdrop-blur-xl border border-border/70 rounded-lg sm:rounded-xl group-hover:backdrop-blur-2xl group-hover:bg-card/90 transition-all duration-500">
							<form
								onSubmit={onSendMessage}
								className="p-2 sm:p-3"
							>
								{/* Input section */}
								<div className="mb-2 sm:mb-3">
									<textarea
										ref={textareaRef}
										value={input}
										onChange={(e) =>
											setInput(e.target.value)
										}
										placeholder="Ask anything..."
										rows={1}
										className="w-full min-h-[40px] sm:min-h-[44px] md:min-h-[48px] max-h-[100px] sm:max-h-[120px] px-2 sm:px-3 py-2 sm:py-3 resize-none border-0 bg-transparent focus:outline-none focus:ring-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground overflow-y-auto"
										style={{ resize: "none" }}
										onKeyDown={(e) => {
											if (
												e.key === "Enter" &&
												!e.shiftKey
											) {
												e.preventDefault();
												onSendMessage(e);
											}
										}}
									/>
								</div>

								{/* Controls section */}
								<div className="flex items-center justify-between gap-2 sm:gap-3 pt-2">
									{/* Model selector */}
									<div className="flex items-center">
										<ModelSelector
											value={selectedModel}
											onValueChange={setSelectedModel}
										/>
									</div>

									{/* Send button */}
									<Button
										type="submit"
										size="sm"
										disabled={!input.trim() || isLoading}
										className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer rounded-md sm:rounded-lg"
									>
										<FaArrowUpLong className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
										<span className="sr-only">
											Send message
										</span>
									</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

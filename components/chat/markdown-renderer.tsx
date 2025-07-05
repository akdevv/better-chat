"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { ComponentPropsWithoutRef } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { useState } from "react";

import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.min.css";

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

function CodeBlock({
	children,
	className,
	...props
}: ComponentPropsWithoutRef<"pre"> & { children: React.ReactNode }) {
	const [copied, setCopied] = useState(false);

	// Extract language from className if available
	const language = className?.match(/language-(\w+)/)?.[1] || "";

	// Extract text content for copying
	const getTextContent = (node: React.ReactNode): string => {
		if (typeof node === "string") return node;
		if (typeof node === "number") return node.toString();
		if (Array.isArray(node)) return node.map(getTextContent).join("");
		if (node && typeof node === "object" && "props" in node) {
			const element = node as React.ReactElement<{
				children: React.ReactNode;
			}>;
			return getTextContent(element.props?.children);
		}
		return "";
	};

	const codeText = getTextContent(children);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(codeText);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<div className="my-3 rounded-lg overflow-hidden border border-border/30 bg-muted/20">
			{/* Header with language and copy button */}
			<div className="flex items-center justify-between bg-muted/40 px-3 py-2 border-b border-border/20">
				<span className="text-xs font-medium text-muted-foreground">
					{language || "code"}
				</span>
				<button
					onClick={copyToClipboard}
					className="flex cursor-pointer items-center gap-1.5 px-2 py-1 text-xs bg-background/60 hover:bg-background/80 border border-border/40 rounded-md transition-colors font-medium text-muted-foreground hover:text-foreground"
				>
					{copied ? (
						<>
							<FiCheck className="w-3 h-3" />
							<span>Copied</span>
						</>
					) : (
						<>
							<FiCopy className="w-3 h-3" />
							<span>Copy</span>
						</>
					)}
				</button>
			</div>

			{/* Code content */}
			<pre
				{...props}
				className="bg-muted/10 text-foreground p-3 overflow-x-auto text-sm leading-relaxed font-mono"
			>
				{children}
			</pre>
		</div>
	);
}

export function MarkdownRenderer({
	content,
	className = "",
}: MarkdownRendererProps) {
	// Helper function to strip leading/trailing whitespace from children
	const stripWhitespace = (children: React.ReactNode): React.ReactNode => {
		if (typeof children === "string") {
			return children.trim();
		}
		if (Array.isArray(children)) {
			return children.map(stripWhitespace);
		}
		return children;
	};

	// Preprocess content to ensure markdown links are properly formatted
	const preprocessContent = (text: string): string => {
		// Handle markdown links that might not be getting parsed
		// Pattern: [text](url) - ensure proper spacing and formatting
		return text.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			(match, linkText, url) => {
				// Clean up the URL (remove extra spaces, ensure proper protocol)
				const cleanUrl = url.trim();
				const cleanText = linkText.trim();

				// If URL doesn't start with http/https, add https://
				const finalUrl = cleanUrl.match(/^https?:\/\//)
					? cleanUrl
					: `https://${cleanUrl}`;

				return `[${cleanText}](${finalUrl})`;
			}
		);
	};

	const processedContent = preprocessContent(content);

	return (
		<div
			className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeKatex, rehypeHighlight]}
				components={{
					pre: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"pre">) => {
						const codeChild = Array.isArray(children)
							? children.find(
									(child) =>
										child?.type === "code" ||
										(child?.props && child.props.className)
							  )
							: children;

						if (
							codeChild &&
							typeof codeChild === "object" &&
							"props" in codeChild
						) {
							return (
								<CodeBlock
									className={codeChild.props.className}
									{...props}
								>
									{children}
								</CodeBlock>
							);
						}

						return <CodeBlock {...props}>{children}</CodeBlock>;
					},

					// Inline code
					code: ({
						inline,
						children,
						...props
					}: ComponentPropsWithoutRef<"code"> & {
						inline?: boolean;
					}) => {
						if (inline) {
							return (
								<code
									{...props}
									className="bg-muted/40 text-foreground px-1.5 py-0.5 rounded text-xs font-mono"
								>
									{children}
								</code>
							);
						}
						return (
							<code
								{...props}
								className="text-foreground text-xs font-mono"
							>
								{children}
							</code>
						);
					},

					table: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"table">) => (
						<div className="overflow-x-auto my-3 rounded-lg border border-border/30">
							<table
								{...props}
								className="min-w-full border-collapse text-sm"
							>
								{stripWhitespace(children)}
							</table>
						</div>
					),

					th: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"th">) => (
						<th
							{...props}
							className="border-b border-border/30 bg-muted/30 px-3 py-2 text-left font-medium text-foreground text-xs"
						>
							{stripWhitespace(children)}
						</th>
					),

					td: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"td">) => (
						<td
							{...props}
							className="border-b border-border/20 px-3 py-2 text-muted-foreground text-xs"
						>
							{stripWhitespace(children)}
						</td>
					),

					blockquote: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"blockquote">) => (
						<blockquote
							{...props}
							className="border-l-2 border-muted/50 pl-4 py-2 my-3 bg-muted/20 text-muted-foreground italic rounded-r"
						>
							{stripWhitespace(children)}
						</blockquote>
					),

					h1: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"h1">) => (
						<h1
							{...props}
							className="text-lg font-bold text-foreground"
						>
							{stripWhitespace(children)}
						</h1>
					),

					h2: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"h2">) => (
						<h2
							{...props}
							className="text-base font-bold text-foreground"
						>
							{stripWhitespace(children)}
						</h2>
					),

					h3: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"h3">) => (
						<h3
							{...props}
							className="text-sm font-semibold text-foreground"
						>
							{stripWhitespace(children)}
						</h3>
					),

					ul: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"ul">) => (
						<ul
							{...props}
							className="list-disc list-outside ml-6 pl-2 space-y-1 text-foreground my-2"
						>
							{stripWhitespace(children)}
						</ul>
					),

					ol: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"ol">) => (
						<ol
							{...props}
							className="list-decimal list-outside ml-6 pl-2 space-y-1 text-foreground my-2"
						>
							{stripWhitespace(children)}
						</ol>
					),

					li: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"li">) => (
						<li
							{...props}
							className="text-foreground leading-relaxed"
						>
							{stripWhitespace(children)}
						</li>
					),

					p: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"p">) => {
						// Process paragraph content to handle potential inline links
						const processTextNodes = (
							node: React.ReactNode
						): React.ReactNode => {
							if (typeof node === "string") {
								// Check if this text contains markdown-style links that weren't parsed
								if (node.includes("[") && node.includes("](")) {
									// Split the text and create proper link elements
									const parts = node.split(
										/(\[[^\]]+\]\([^)]+\))/g
									);
									return parts.map((part, index) => {
										const linkMatch = part.match(
											/\[([^\]]+)\]\(([^)]+)\)/
										);
										if (linkMatch) {
											const [, linkText, url] = linkMatch;
											const cleanUrl = url.trim();
											const finalUrl = cleanUrl.match(
												/^https?:\/\//
											)
												? cleanUrl
												: `https://${cleanUrl}`;
											return (
												<a
													key={index}
													href={finalUrl}
													className="text-primary hover:text-primary/80 underline transition-colors"
													target="_blank"
													rel="noopener noreferrer"
												>
													{linkText.trim()}
												</a>
											);
										}
										return part;
									});
								}
								return node;
							}
							if (Array.isArray(node)) {
								return node.map(processTextNodes);
							}
							return node;
						};

						return (
							<p
								{...props}
								className="text-foreground leading-relaxed"
							>
								{processTextNodes(stripWhitespace(children))}
							</p>
						);
					},

					strong: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"strong">) => (
						<strong
							{...props}
							className="font-semibold text-foreground"
						>
							{stripWhitespace(children)}
						</strong>
					),

					em: ({
						children,
						...props
					}: ComponentPropsWithoutRef<"em">) => (
						<em {...props} className="italic text-foreground/90">
							{stripWhitespace(children)}
						</em>
					),

					a: ({
						children,
						href,
						...props
					}: ComponentPropsWithoutRef<"a">) => {
						// Ensure href is properly formatted
						const cleanHref = href?.trim() || "";
						const finalHref = cleanHref.match(/^https?:\/\//)
							? cleanHref
							: `https://${cleanHref}`;

						return (
							<a
								{...props}
								href={finalHref}
								className="text-primary hover:text-primary/80 underline transition-colors"
								target="_blank"
								rel="noopener noreferrer"
							>
								{stripWhitespace(children)}
							</a>
						);
					},

					hr: ({ ...props }: ComponentPropsWithoutRef<"hr">) => (
						<hr {...props} className="my-4 border-border" />
					),
				}}
			>
				{processedContent}
			</ReactMarkdown>
		</div>
	);
}

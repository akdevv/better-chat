"use client";

import { useState, useEffect } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (newTitle: string) => void;
	currentTitle: string;
	isLoading?: boolean;
}

export function RenameDialog({
	open,
	onOpenChange,
	onConfirm,
	currentTitle,
	isLoading = false,
}: RenameDialogProps) {
	const [title, setTitle] = useState(currentTitle);
	const [error, setError] = useState("");

	const handleConfirm = () => {
		const trimmedTitle = title.trim();

		if (!trimmedTitle) {
			setError("Title cannot be empty");
			return;
		}

		if (trimmedTitle.length > 100) {
			setError("Title must be less than 100 characters");
			return;
		}

		onConfirm(trimmedTitle);
	};

	useEffect(() => {
		if (open) {
			setTitle(currentTitle);
			setError("");
		}
	}, [open, currentTitle]);

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Rename Chat</AlertDialogTitle>
					<AlertDialogDescription>
						Enter a new name for your chat. Keep it concise and descriptive.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="my-4">
					<Label htmlFor="chat-title">Chat Title</Label>
					<Input
						id="chat-title"
						value={title}
						onChange={(e) => {
							setTitle(e.target.value);
							setError("");
						}}
						onKeyDown={(e: React.KeyboardEvent) => {
							if (e.key === "Enter") {
								handleConfirm();
							}
						}}
						placeholder="Enter chat title..."
						maxLength={100}
						disabled={isLoading}
						className="mt-2"
					/>
					<div className="flex justify-between mt-1">
						{error && (
							<p className="text-sm text-red-500">
								{error || "Something went wrong"}
							</p>
						)}
						<p className="text-sm text-muted-foreground ml-auto">
							{title.length}/100
						</p>
					</div>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading} className="cursor-pointer">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={isLoading}
						className="cursor-pointer"
					>
						{isLoading ? "Renaming..." : "Rename"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

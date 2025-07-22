"use client";

import { useApiKeys } from "@/hooks/use-api-keys";
import { ApiKeyState } from "@/lib/types/api-keys";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/spinner";
import { FaGoogle } from "react-icons/fa";
import { RiDeleteBinLine, RiOpenaiFill } from "react-icons/ri";
import { RiAnthropicFill } from "react-icons/ri";
import { MdEdit } from "react-icons/md";

const providers = [
	{
		id: "openai",
		name: "OpenAI",
		icon: RiOpenaiFill,
		placeholder: "Enter your OpenAI API key (sk-...)",
	},
	{
		id: "anthropic",
		name: "Anthropic",
		icon: RiAnthropicFill,
		placeholder: "Enter your Anthropic API key (sk-ant-...)",
	},
	{
		id: "google",
		name: "Google AI",
		icon: FaGoogle,
		placeholder: "Enter your Google AI API key (AIza...)",
	},
];

export function ApiKeyCards() {
	const {
		apiKeys,
		isInitialLoading,
		generateMaskedKey,
		toggleEdit,
		handleInputChange,
		saveKey,
		cancelEdit,
		deleteKey,
	} = useApiKeys();

	const getStatusBadge = (apiKey: ApiKeyState) => {
		if (apiKey.isVerifying) {
			return (
				<Badge className="rounded-full text-xs bg-transparent border border-indigo-400 text-indigo-400">
					<p className="animate-pulse">Verifying...</p>
				</Badge>
			);
		}

		switch (apiKey.status) {
			case "verified":
				return (
					<Badge className="rounded-full text-xs bg-transparent border border-emerald-500 text-emerald-500">
						Verified
					</Badge>
				);
			case "invalid":
				return (
					<Badge className="rounded-full text-xs bg-transparent border border-red-500 text-red-500">
						Invalid
					</Badge>
				);
			default:
				return null;
		}
	};

	if (isInitialLoading) {
		return (
			<div className="space-y-4">
				{providers.map((provider) => (
					<Card
						key={provider.id}
						className="p-6 border border-border/40 shadow-sm"
					>
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted/60 border border-border/20">
								<provider.icon className="h-5 w-5 text-foreground/70" />
							</div>
							<div className="flex-1">
								<div className="h-4 bg-muted rounded w-24 mb-2"></div>
								<div className="h-3 bg-muted rounded w-16"></div>
							</div>
						</div>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{providers.map((provider) => {
				const IconComponent = provider.icon;
				const apiKey: ApiKeyState = apiKeys.find(
					(key) => key.id === provider.id,
				)!;

				return (
					<Card
						key={provider.id}
						className="p-6 border border-border/40 shadow-sm hover:shadow-md transition-shadow"
					>
						<div className="space-y-4">
							{/* Provider Header */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted/60 border border-border/20">
										<IconComponent className="h-5 w-5 text-foreground/70" />
									</div>
									<div className="flex items-center gap-3">
										<h3 className="font-semibold text-base">{provider.name}</h3>
										{getStatusBadge(apiKey)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									{!apiKey.isEditing && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => toggleEdit(provider.id)}
											disabled={apiKey.isLoading}
											className="h-8 w-8 p-0 cursor-pointer"
										>
											{apiKey.isLoading ? (
												<Spinner size="sm" />
											) : (
												<MdEdit className="h-4 w-4" />
											)}
										</Button>
									)}
								</div>
							</div>

							{/* API Key Display/Edit */}
							{apiKey.isEditing ? (
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<input
											type="text"
											placeholder={provider.placeholder}
											value={apiKey.key}
											onChange={(e) =>
												handleInputChange(provider.id, e.target.value)
											}
											className="font-mono text-sm flex-1 bg-muted border border-border/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-0"
										/>
										<Button
											variant="outline"
											size="sm"
											onClick={() => deleteKey(provider.id)}
											disabled={apiKey.isDeleting}
											className="h-12 w-12 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-none cursor-pointer"
										>
											{apiKey.isDeleting ? (
												<Spinner />
											) : (
												<RiDeleteBinLine className="h-6 w-6" />
											)}
										</Button>
									</div>

									<div className="flex justify-end gap-2">
										<Button
											variant="outline"
											onClick={() => cancelEdit(provider.id)}
											disabled={apiKey.isSaving}
											className="h-8 px-3 cursor-pointer"
										>
											Cancel
										</Button>
										<Button
											variant="default"
											onClick={() => saveKey(provider.id)}
											disabled={!apiKey.key.trim() || apiKey.isSaving}
											className="h-8 px-3 cursor-pointer flex items-center gap-2"
										>
											{apiKey.isSaving ? (
												<>
													<Spinner size="sm" color="dark" />
													Saving...
												</>
											) : (
												"Save"
											)}
										</Button>
									</div>
								</div>
							) : (
								apiKey.status === "verified" && (
									<div className="bg-muted border border-border/20 rounded-lg px-4 py-3">
										<div className="text-sm font-mono text-muted-foreground">
											{generateMaskedKey(provider.id)}
										</div>
									</div>
								)
							)}
						</div>
					</Card>
				);
			})}
		</div>
	);
}

import { ApiKeyCards } from "@/components/settings/api-key-cards";

export default function ApiKeysPage() {
	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold">API Keys</h1>
				<p className="text-sm text-muted-foreground">
					Manage your API keys for different AI providers
				</p>
			</div>

			{/* API Keys Cards */}
			<ApiKeyCards />

			{/* Help Section */}
			<div className="space-y-3">
				<h3 className="font-medium text-foreground">
					Getting Your API Keys
				</h3>
				<div className="space-y-2 text-sm text-muted-foreground">
					<div className="flex items-center gap-3">
						<span className="w-20 font-medium">OpenAI</span>
						<a
							href="https://platform.openai.com/api-keys"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors underline underline-offset-4"
						>
							platform.openai.com
						</a>
					</div>
					<div className="flex items-center gap-3">
						<span className="w-20 font-medium">Anthropic</span>
						<a
							href="https://console.anthropic.com/settings/keys"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors underline underline-offset-4"
						>
							console.anthropic.com
						</a>
					</div>
					<div className="flex items-center gap-3">
						<span className="w-20 font-medium">Google AI</span>
						<a
							href="https://aistudio.google.com/app/apikey"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors underline underline-offset-4"
						>
							aistudio.google.com
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

export interface ApiKeyData {
	id: string;
	provider: "openai" | "google" | "anthropic";
	isValidated: boolean;
	lastValidated?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface ApiKeyState {
	id: string;
	provider: "openai" | "google" | "anthropic";
	key: string;
	isEditing: boolean;
	status: "none" | "invalid" | "verified";
	isLoading: boolean;
	isVerifying: boolean;
	isDeleting: boolean;
	isSaving: boolean;
}

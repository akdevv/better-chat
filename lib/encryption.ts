import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY =
	process.env.ENCRYPTION_KEY ||
	"x4ZxiOelxRwCmn5++ogJpj5zxnMbpAjdNq+QetGriig=";

export function encrypt(text: string, userId: string) {
	try {
		const salt = crypto
			.createHash("sha256")
			.update(userId)
			.digest("hex")
			.slice(0, 16);
		const key = crypto
			.createHash("sha256")
			.update(ENCRYPTION_KEY + salt)
			.digest();

		// Create initialization vector
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

		let encrypted = cipher.update(text, "utf8", "hex");
		encrypted += cipher.final("hex");

		// Return iv + encrypted data
		return iv.toString("hex") + ":" + encrypted;
	} catch (error) {
		console.error("Encryption error:", error);
		throw new Error("Failed to encrypt data");
	}
}

export function decrypt(encryptedText: string, userId: string) {
	try {
		const parts = encryptedText.split(":");
		if (parts.length !== 2) {
			throw new Error("Invalid encrypted data format");
		}

		const [ivHex, encrypted] = parts;
		const iv = Buffer.from(ivHex, "hex");

		const salt = crypto
			.createHash("sha256")
			.update(userId)
			.digest("hex")
			.slice(0, 16);

		// Create a 32-byte key from the encryption key and salt
		const key = crypto
			.createHash("sha256")
			.update(ENCRYPTION_KEY + salt)
			.digest();

		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

		let decrypted = decipher.update(encrypted, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		console.error("Decryption error:", error);
		throw new Error("Failed to decrypt data");
	}
}

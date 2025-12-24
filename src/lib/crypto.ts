// ConsoleCV - Encryption Utilities
// Secure AES-256-GCM encryption for storing sensitive data like GitHub PATs
// Uses Node.js built-in crypto module

import crypto from "crypto";

// =============================================================================
// CONSTANTS
// =============================================================================

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag
const SALT_LENGTH = 32;

// =============================================================================
// ENCRYPTION UTILITIES
// =============================================================================

/**
 * Derives a 256-bit key from the provided encryption key using PBKDF2
 * This ensures the key is the correct length even if the env var format varies
 */
function deriveKey(key: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(key, salt, 100000, 32, "sha256");
}

/**
 * Encrypts plaintext using AES-256-GCM
 * @param text - The plaintext to encrypt
 * @param encryptionKey - The encryption key (from GITHUB_PAT_ENCRYPTION_KEY env var)
 * @returns Base64-encoded string containing salt:iv:authTag:ciphertext
 */
export function encrypt(text: string, encryptionKey?: string): string {
    const key = encryptionKey || process.env.GITHUB_PAT_ENCRYPTION_KEY;

    if (!key) {
        throw new Error("Encryption key not configured. Set GITHUB_PAT_ENCRYPTION_KEY environment variable.");
    }

    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from password
    const derivedKey = deriveKey(key, salt);

    // Create cipher and encrypt
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get the auth tag for GCM mode
    const authTag = cipher.getAuthTag();

    // Combine salt, iv, authTag, and ciphertext
    // Format: base64(salt):base64(iv):base64(authTag):hex(ciphertext)
    return [
        salt.toString("base64"),
        iv.toString("base64"),
        authTag.toString("base64"),
        encrypted,
    ].join(":");
}

/**
 * Decrypts ciphertext using AES-256-GCM
 * @param encrypted - The encrypted string from encrypt()
 * @param encryptionKey - The encryption key (from GITHUB_PAT_ENCRYPTION_KEY env var)
 * @returns The decrypted plaintext
 */
export function decrypt(encrypted: string, encryptionKey?: string): string {
    const key = encryptionKey || process.env.GITHUB_PAT_ENCRYPTION_KEY;

    if (!key) {
        throw new Error("Encryption key not configured. Set GITHUB_PAT_ENCRYPTION_KEY environment variable.");
    }

    // Split the encrypted string into components
    const parts = encrypted.split(":");
    if (parts.length !== 4) {
        throw new Error("Invalid encrypted data format");
    }

    const [saltB64, ivB64, authTagB64, ciphertext] = parts;

    // Decode components
    const salt = Buffer.from(saltB64, "base64");
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");

    // Derive the same key
    const derivedKey = deriveKey(key, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

/**
 * Generates a secure random encryption key (for documentation/setup purposes)
 * Usage: Run this once to generate your GITHUB_PAT_ENCRYPTION_KEY
 * @returns A 64-character hex string (256 bits)
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Validates that an encryption key exists and is properly configured
 * @returns true if configured, throws if not
 */
export function validateEncryptionConfig(): boolean {
    const key = process.env.GITHUB_PAT_ENCRYPTION_KEY;

    if (!key) {
        throw new Error(
            "Missing GITHUB_PAT_ENCRYPTION_KEY environment variable. " +
            "Generate one using: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
        );
    }

    if (key.length < 16) {
        throw new Error(
            "GITHUB_PAT_ENCRYPTION_KEY is too short. It should be at least 16 characters."
        );
    }

    return true;
}

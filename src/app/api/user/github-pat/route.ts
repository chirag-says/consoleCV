// ConsoleCV - GitHub PAT API Route
// Securely manages user's GitHub Personal Access Token

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { encrypt, validateEncryptionConfig } from "@/lib/crypto";
import { z } from "zod";

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const githubPatSchema = z.object({
    githubPat: z.string().max(500, "Token too long"), // Can be empty to remove
});

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns a consistent JSON error response
 */
function errorResponse(error: string, status: number = 500) {
    return NextResponse.json({ error, status }, { status });
}

// =============================================================================
// GET - Check if user has a GitHub PAT saved
// =============================================================================

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return errorResponse("Unauthorized", 401);
        }

        await dbConnect();

        // Query with explicit field selection for the encrypted PAT
        const user = await User.findById(session.user.id)
            .select("+githubPatEncrypted")
            .lean();

        if (!user) {
            return errorResponse("User not found", 404);
        }

        // SECURITY: Never return the actual token, only a boolean
        return NextResponse.json({
            hasGitHubPat: !!(user.githubPatEncrypted && user.githubPatEncrypted.length > 0),
        });
    } catch (error) {
        console.error("[GitHub PAT GET] Error:", error);
        return errorResponse("Failed to check GitHub PAT status");
    }
}

// =============================================================================
// POST - Save or update GitHub PAT
// =============================================================================

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return errorResponse("Unauthorized", 401);
        }

        // Validate encryption is configured
        try {
            validateEncryptionConfig();
        } catch (error) {
            console.error("[GitHub PAT POST] Encryption not configured:", error);
            return errorResponse("Server configuration error", 500);
        }

        // Parse and validate request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return errorResponse("Invalid JSON body", 400);
        }

        const validation = githubPatSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(validation.error.issues[0]?.message || "Invalid input", 400);
        }

        const { githubPat } = validation.data;

        await dbConnect();

        // If empty string, remove the token
        if (!githubPat.trim()) {
            await User.findByIdAndUpdate(session.user.id, {
                $unset: { githubPatEncrypted: "" },
            });

            return NextResponse.json({
                success: true,
                message: "GitHub PAT removed",
            });
        }

        // Basic validation for GitHub token format
        // GitHub tokens typically start with ghp_, github_pat_, gho_, ghu_, ghs_, or ghr_
        const validPrefixes = ["ghp_", "github_pat_", "gho_", "ghu_", "ghs_", "ghr_"];
        const hasValidPrefix = validPrefixes.some((prefix) =>
            githubPat.startsWith(prefix)
        );

        if (!hasValidPrefix) {
            return errorResponse(
                "Invalid GitHub token format. Token should start with ghp_, github_pat_, or similar prefixes.",
                400
            );
        }

        // Encrypt the PAT before storing
        // SECURITY: The PAT is never logged or stored in plaintext
        const encryptedPat = encrypt(githubPat);

        // Update user with encrypted PAT
        await User.findByIdAndUpdate(session.user.id, {
            githubPatEncrypted: encryptedPat,
        });

        return NextResponse.json({
            success: true,
            message: "GitHub PAT saved successfully",
        });
    } catch (error) {
        console.error("[GitHub PAT POST] Error:", error);
        return errorResponse("Failed to save GitHub PAT");
    }
}

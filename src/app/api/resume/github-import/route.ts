// ConsoleCV - GitHub Import API Route
// Server-side endpoint to import GitHub projects using user's PAT

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { decrypt } from "@/lib/crypto";
import { importGitHubProjects, fetchGitHubRepos, mapReposToProjects } from "@/lib/github";
import { z } from "zod";
import type { Project } from "@/types/resume";

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const importSchema = z.object({
    username: z
        .string()
        .min(1, "Username is required")
        .max(39, "Invalid GitHub username") // GitHub usernames max 39 chars
        .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/, "Invalid GitHub username format"),
    limit: z
        .number()
        .int()
        .min(1, "Minimum 1 repository")
        .max(20, "Maximum 20 repositories")
        .optional()
        .default(6),
});

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns a consistent JSON error response
 */
function errorResponse(error: string, status: number = 500, extra?: Record<string, unknown>) {
    return NextResponse.json({ error, status, ...extra }, { status });
}

/**
 * Retrieves and decrypts the user's GitHub PAT
 * Returns null if not set
 */
async function getUserGitHubPat(userId: string): Promise<string | null> {
    try {
        const user = await User.findById(userId)
            .select("+githubPatEncrypted")
            .lean();

        if (!user?.githubPatEncrypted) {
            return null;
        }

        return decrypt(user.githubPatEncrypted);
    } catch (error) {
        console.error("[GitHub Import] Failed to decrypt PAT:", error);
        return null;
    }
}

// =============================================================================
// POST - Import GitHub Projects
// =============================================================================

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return errorResponse("Unauthorized", 401);
        }

        // Parse and validate request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return errorResponse("Invalid JSON body", 400);
        }

        const validation = importSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(validation.error.issues[0]?.message || "Invalid input", 400);
        }

        const { username, limit } = validation.data;

        await dbConnect();

        // Get user's GitHub PAT (if set)
        const githubPat = await getUserGitHubPat(session.user.id);
        const isAuthenticated = !!githubPat;

        let projects: Project[];
        let warning: string | undefined;

        try {
            // Import projects using the enhanced function
            projects = await importGitHubProjects(username, limit, githubPat || undefined);

            // Add warning if using unauthenticated requests
            if (!isAuthenticated) {
                warning =
                    "Using unauthenticated GitHub API (60 requests/hour limit). " +
                    "Add a Personal Access Token in Settings for 5,000 requests/hour.";
            }
        } catch (error) {
            // Check if it's a rate limit error
            const errorObj = error as Error & { isRateLimited?: boolean; requiresAuth?: boolean };

            if (errorObj.isRateLimited) {
                return errorResponse(
                    errorObj.message,
                    429,
                    { isRateLimited: true, requiresAuth: errorObj.requiresAuth }
                );
            }

            // Re-throw other errors
            throw error;
        }

        if (projects.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    projects: [],
                    warning: `No public repositories found for user "${username}".`,
                    isAuthenticated,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                projects,
                count: projects.length,
                username,
                isAuthenticated,
                warning,
            },
        });
    } catch (error) {
        console.error("[GitHub Import] Error:", error);

        // Handle known error types
        if (error instanceof Error) {
            if (error.message.includes("not found")) {
                return errorResponse(error.message, 404);
            }
        }

        return errorResponse("Failed to import GitHub projects");
    }
}

// =============================================================================
// GET - Quick preview (for simple cases)
// =============================================================================

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return errorResponse("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");

        if (!username) {
            return errorResponse("Username parameter is required", 400);
        }

        // Validate username format
        const validation = z.string()
            .min(1)
            .max(39)
            .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/)
            .safeParse(username);

        if (!validation.success) {
            return errorResponse("Invalid GitHub username format", 400);
        }

        await dbConnect();

        // Get user's GitHub PAT (if set)
        const githubPat = await getUserGitHubPat(session.user.id);

        // Fetch just the repo list (quick operation)
        const repos = await fetchGitHubRepos(username, 10, githubPat || undefined);

        // Map to simplified projects (no deep analysis for preview)
        const projects = mapReposToProjects(repos);

        return NextResponse.json({
            success: true,
            data: {
                projects,
                count: projects.length,
                username,
                isAuthenticated: !!githubPat,
            },
        });
    } catch (error) {
        console.error("[GitHub Import GET] Error:", error);
        return errorResponse("Failed to fetch GitHub repos");
    }
}

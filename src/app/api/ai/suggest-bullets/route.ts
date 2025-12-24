// ConsoleCV - AI Bullet Suggestions API Route
// Provides AI-powered resume bullet point generation using Groq

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateBulletSuggestions, validateGroqConfig } from "@/lib/ai";
import { z } from "zod";

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const suggestBulletsSchema = z.object({
    techStack: z
        .string()
        .max(500, "Tech stack description too long")
        .optional(),
    projectDescription: z
        .string()
        .max(2000, "Project description too long")
        .optional(),
    role: z
        .string()
        .max(200, "Role description too long")
        .optional(),
    numBullets: z
        .number()
        .int()
        .min(1, "Minimum 1 bullet")
        .max(5, "Maximum 5 bullets")
        .optional()
        .default(3),
}).refine(
    (data) => data.techStack || data.projectDescription || data.role,
    {
        message: "At least one of techStack, projectDescription, or role is required",
    }
);

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
// POST - Generate Bullet Suggestions
// =============================================================================

export async function POST(request: NextRequest) {
    try {
        // Validate user is authenticated
        const session = await auth();

        if (!session?.user?.id) {
            return errorResponse("Unauthorized", 401);
        }

        // Validate Groq API is configured
        try {
            validateGroqConfig();
        } catch (error) {
            console.error("[AI] Groq not configured:", error);
            return errorResponse(
                "AI service is not configured. Please contact support.",
                503
            );
        }

        // Parse and validate request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return errorResponse("Invalid JSON body", 400);
        }

        const validation = suggestBulletsSchema.safeParse(body);
        if (!validation.success) {
            const errorMessage =
                validation.error.issues[0]?.message || "Invalid input";
            return errorResponse(errorMessage, 400);
        }

        const { techStack, projectDescription, role, numBullets } = validation.data;

        // Generate bullet suggestions
        const result = await generateBulletSuggestions({
            techStack,
            projectDescription,
            role,
            numBullets,
        });

        return NextResponse.json({
            success: true,
            bullets: result.bullets,
        });
    } catch (error) {
        console.error("[AI Suggest Bullets] Error:", error);

        // Handle known error types
        if (error instanceof Error) {
            // Rate limit error
            if (error.message.includes("rate limit")) {
                return errorResponse(
                    "AI service is busy. Please try again in a few seconds.",
                    429
                );
            }

            // API key error
            if (error.message.includes("Invalid GROQ_API_KEY")) {
                return errorResponse(
                    "AI service authentication failed. Please contact support.",
                    503
                );
            }

            // Generic AI error - don't expose internal details
            if (error.message.includes("Groq API")) {
                return errorResponse(
                    "AI service temporarily unavailable. Please try again.",
                    503
                );
            }
        }

        return errorResponse("Failed to generate suggestions. Please try again.");
    }
}

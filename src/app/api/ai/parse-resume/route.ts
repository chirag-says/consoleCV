// ConsoleCV - AI Resume Parsing API Route
// Server-side endpoint to parse resume text using Groq's Llama 3 model

import { NextRequest, NextResponse } from "next/server";
import { extractResumeWithAI, validateGroqConfig } from "@/lib/ai";
import { z } from "zod";

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const parseResumeSchema = z.object({
    text: z
        .string()
        .min(50, "Resume text is too short")
        .max(50000, "Resume text is too long"),
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
// POST - Parse Resume with AI
// =============================================================================

export async function POST(request: NextRequest) {
    try {
        // Validate Groq API is configured
        try {
            validateGroqConfig();
        } catch (error) {
            console.error("[AI Parse] Groq not configured:", error);
            return errorResponse(
                "AI service is not configured. Resume parsing unavailable.",
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

        const validation = parseResumeSchema.safeParse(body);
        if (!validation.success) {
            const errorMessage =
                validation.error.issues[0]?.message || "Invalid input";
            return errorResponse(errorMessage, 400);
        }

        const { text } = validation.data;

        // Extract resume data using AI
        console.log("[AI Parse] Starting AI extraction, text length:", text.length);
        const result = await extractResumeWithAI(text);

        if (!result.success || !result.data) {
            return NextResponse.json({
                success: false,
                error: result.error || "Failed to parse resume",
                rawAIResponse: result.rawAIResponse,
            });
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        console.error("[AI Parse] Error:", error);

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
                    "AI service authentication failed.",
                    503
                );
            }
        }

        return errorResponse("Failed to parse resume. Please try again.");
    }
}

// ConsoleCV - AI Utilities (Groq API)
// Provides AI-powered content generation using Groq's Llama 3 models
// Groq offers free, fast inference for open-source models

// =============================================================================
// TYPES
// =============================================================================

interface BulletSuggestionParams {
    techStack?: string;
    projectDescription?: string;
    role?: string;
    numBullets?: number;
}

interface BulletSuggestionResponse {
    bullets: string[];
}

interface GroqChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface GroqChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const GROQ_API_BASE = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama3-70b-8192"; // High-performance open-source model

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

const BULLET_GENERATION_SYSTEM_PROMPT = `You are an expert resume writer specializing in software engineering and technical roles. Your task is to generate concise, results-oriented bullet points for resume projects or experiences.

GUIDELINES:
- Each bullet should be 1-2 lines max
- Start with strong action verbs (Developed, Implemented, Built, Designed, Optimized, etc.)
- Include specific technologies when relevant
- Focus on impact, outcomes, and measurable results where possible
- Avoid fluff, buzzwords, and vague statements
- Use professional, confident language

OUTPUT FORMAT:
You MUST respond with valid JSON only. No markdown, no explanations.
Format: { "bullets": ["bullet1", "bullet2", "bullet3"] }`;

// =============================================================================
// GROQ API HELPERS
// =============================================================================

/**
 * Calls the Groq Chat Completions API
 */
async function callGroqAPI(
    messages: GroqChatMessage[],
    options: {
        temperature?: number;
        maxTokens?: number;
    } = {}
): Promise<GroqChatResponse> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GROQ_API_KEY is not configured. Get a free API key at https://console.groq.com"
        );
    }

    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages,
            temperature: options.temperature ?? 0.3, // Low for deterministic output
            max_tokens: options.maxTokens ?? 512,
            response_format: { type: "json_object" }, // Enforce JSON response
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
            (errorData as { error?: { message?: string } }).error?.message ||
            response.statusText;

        if (response.status === 401) {
            throw new Error("Invalid GROQ_API_KEY. Please check your API key.");
        }

        if (response.status === 429) {
            throw new Error(
                "Groq API rate limit exceeded. Please wait a moment and try again."
            );
        }

        throw new Error(`Groq API error: ${errorMessage}`);
    }

    return response.json();
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Generates smart bullet point suggestions for a project or experience
 * Uses Groq's Llama 3 model for free, fast inference
 *
 * @param params - Configuration for bullet generation
 * @returns Promise<BulletSuggestionResponse> with generated bullets
 */
export async function generateBulletSuggestions(
    params: BulletSuggestionParams
): Promise<BulletSuggestionResponse> {
    const { techStack, projectDescription, role, numBullets = 3 } = params;

    // Build the user prompt based on available information
    let userPrompt = `Generate ${numBullets} professional resume bullet points`;

    if (role) {
        userPrompt += ` for a ${role} role`;
    }

    if (projectDescription || techStack) {
        userPrompt += ` based on the following:`;

        if (projectDescription) {
            userPrompt += `\n\nProject/Experience Description:\n${projectDescription}`;
        }

        if (techStack) {
            userPrompt += `\n\nTechnologies Used:\n${techStack}`;
        }
    } else {
        // Generic bullets for software engineering
        userPrompt += ` for a software engineering project.`;
    }

    userPrompt += `\n\nRespond with valid JSON only: { "bullets": ["...", "..."] }`;

    try {
        const response = await callGroqAPI([
            { role: "system", content: BULLET_GENERATION_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
        ]);

        // Extract the content from the response
        const content = response.choices[0]?.message?.content;

        if (!content) {
            throw new Error("Empty response from AI");
        }

        // Parse the JSON response
        let parsed: { bullets?: string[] };
        try {
            parsed = JSON.parse(content);
        } catch {
            // Try to extract JSON from the response if it contains extra text
            const jsonMatch = content.match(/\{[\s\S]*"bullets"[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Invalid JSON response from AI");
            }
        }

        if (!Array.isArray(parsed.bullets)) {
            throw new Error("Invalid response format: missing bullets array");
        }

        // Clean and validate bullets
        const cleanedBullets = parsed.bullets
            .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
            .map((b) => b.trim())
            .slice(0, numBullets);

        return { bullets: cleanedBullets };
    } catch (error) {
        console.error("[AI] Failed to generate bullet suggestions:", error);
        throw error;
    }
}

/**
 * Validates that Groq API is properly configured
 * @returns true if configured, throws if not
 */
export function validateGroqConfig(): boolean {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error(
            "Missing GROQ_API_KEY environment variable. " +
            "Get a free API key at https://console.groq.com"
        );
    }

    return true;
}

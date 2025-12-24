// ConsoleCV - AI Utilities (Groq API)
// Provides AI-powered content generation using Groq's Llama 3 models
// Groq offers free, fast inference for open-source models

import {
    aiResumeExtractionSchema,
    type AIResumeExtraction,
} from "./resume-schema";
import type { ResumeData, Education, Experience, Project } from "@/types/resume";

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

export interface ResumeExtractionResult {
    success: boolean;
    data: ResumeData | null;
    rawAIResponse?: string;
    error?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const GROQ_API_BASE = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Latest Llama 3.3 model (replaces deprecated llama3-70b-8192)

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

const RESUME_EXTRACTION_SYSTEM_PROMPT = `You are an expert at extracting structured resume data from raw text. Your task is to parse the following resume text and convert it into a structured JSON object.

EXTRACTION RULES:
1. Extract ALL available information - names, emails, phone numbers, links, education, experience, skills, and projects
2. Use ISO date format (YYYY-MM) when possible. If only a year is given, use "YYYY". If "Present" or "Current", use "Present"
3. If data is genuinely missing, use null for that field - NEVER invent or hallucinate data
4. For skills, extract individual technologies, tools, frameworks, and languages as separate items
5. For experience descriptions, preserve bullet points as a single string with newlines
6. GitHub and LinkedIn should be extracted as usernames or full URLs if available
7. For education, include school name, degree type, field of study, and dates

OUTPUT FORMAT - You MUST respond with ONLY valid JSON, no markdown code blocks:
{
  "personalInfo": {
    "fullName": "string or null",
    "email": "string or null", 
    "phone": "string or null",
    "github": "string or null",
    "linkedin": "string or null",
    "summary": "string or null"
  },
  "education": [
    {
      "school": "string",
      "degree": "string (e.g., 'B.S. in Computer Science')",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or Present",
      "gpa": "string or null",
      "description": "string or null"
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or Present",
      "description": "string with bullet points"
    }
  ],
  "skills": ["skill1", "skill2", ...],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "techStack": ["tech1", "tech2"],
      "link": "string or null"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object. No explanations, no markdown, no code blocks.`;

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
        jsonMode?: boolean;
    } = {}
): Promise<GroqChatResponse> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GROQ_API_KEY is not configured. Get a free API key at https://console.groq.com"
        );
    }

    const requestBody: Record<string, unknown> = {
        model: GROQ_MODEL,
        messages,
        temperature: options.temperature ?? 0.1, // Very low for deterministic output
        max_tokens: options.maxTokens ?? 4096,
    };

    // Only add response_format for JSON mode
    if (options.jsonMode !== false) {
        requestBody.response_format = { type: "json_object" };
    }

    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
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
// PUBLIC API - BULLET SUGGESTIONS
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

// =============================================================================
// PUBLIC API - RESUME EXTRACTION
// =============================================================================

/**
 * Extracts structured resume data from raw PDF text using Groq's Llama 3 model
 * 
 * @param rawText - The raw text extracted from a PDF resume
 * @returns Promise<ResumeExtractionResult> with parsed resume data
 */
export async function extractResumeWithAI(
    rawText: string
): Promise<ResumeExtractionResult> {
    if (!rawText || rawText.trim().length < 50) {
        return {
            success: false,
            data: null,
            error: "Resume text is too short or empty",
        };
    }

    // Truncate if too long (Llama 3 has 8k context, leave room for system prompt)
    const maxTextLength = 6000;
    const truncatedText = rawText.length > maxTextLength
        ? rawText.substring(0, maxTextLength) + "\n[Text truncated...]"
        : rawText;

    try {
        console.log("[AI Resume] Starting extraction, text length:", truncatedText.length);

        const response = await callGroqAPI(
            [
                { role: "system", content: RESUME_EXTRACTION_SYSTEM_PROMPT },
                { role: "user", content: `Parse this resume:\n\n${truncatedText}` },
            ],
            {
                temperature: 0.1, // Very low for accurate extraction
                maxTokens: 4096,
                jsonMode: true,
            }
        );

        const content = response.choices[0]?.message?.content;

        if (!content) {
            throw new Error("Empty response from AI");
        }

        console.log("[AI Resume] Raw response length:", content.length);

        // Parse and validate with Zod
        let parsedData: unknown;
        try {
            // Remove any markdown code blocks if present
            let cleanContent = content.trim();
            if (cleanContent.startsWith("```")) {
                cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
            }
            parsedData = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error("[AI Resume] JSON parse error:", parseError);
            return {
                success: false,
                data: null,
                rawAIResponse: content,
                error: "AI returned invalid JSON format",
            };
        }

        // Validate with Zod schema
        const validationResult = aiResumeExtractionSchema.safeParse(parsedData);

        if (!validationResult.success) {
            console.error("[AI Resume] Validation error:", validationResult.error);
            return {
                success: false,
                data: null,
                rawAIResponse: content,
                error: `Data validation failed: ${validationResult.error.issues[0]?.message}`,
            };
        }

        // Convert AI format to ResumeData format
        const aiData: AIResumeExtraction = validationResult.data;
        const resumeData = convertAIToResumeData(aiData);

        console.log("[AI Resume] Successfully extracted:", {
            educationCount: resumeData.education.length,
            experienceCount: resumeData.experience.length,
            skillsCount: resumeData.skills.length,
            projectsCount: resumeData.projects.length,
        });

        return {
            success: true,
            data: resumeData,
        };
    } catch (error) {
        console.error("[AI Resume] Extraction failed:", error);
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : "AI extraction failed",
        };
    }
}

/**
 * Converts AI extraction format to ResumeData format
 */
function convertAIToResumeData(aiData: AIResumeExtraction): ResumeData {
    // Type-safe access to personal info
    const personalInfo = aiData.personalInfo;

    // Convert education (startDate/endDate -> start/end)
    const education: Education[] = (aiData.education || []).map((edu) => ({
        school: edu.school || "",
        degree: edu.degree || "",
        start: edu.startDate || "",
        end: edu.endDate || "",
    }));

    // Convert experience (startDate/endDate -> start/end)
    const experience: Experience[] = (aiData.experience || []).map((exp) => ({
        company: exp.company || "",
        role: exp.role || "",
        description: exp.description || "",
        start: exp.startDate || "",
        end: exp.endDate || "",
    }));

    // Convert projects (name -> title)
    const projects: Project[] = (aiData.projects || []).map((proj) => ({
        title: proj.name || "",
        description: proj.description || "",
        techStack: proj.techStack || [],
        link: proj.link || "",
    }));

    return {
        personal: {
            fullName: personalInfo?.fullName || "",
            email: personalInfo?.email || "",
            phone: personalInfo?.phone || "",
            github: personalInfo?.github || "",
            linkedin: personalInfo?.linkedin || "",
        },
        education,
        experience,
        projects,
        skills: aiData.skills || [],
    };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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


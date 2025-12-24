// ConsoleCV - Zod Validation Schemas (Bank-Level Security)
// Strict server-side validation to prevent XSS, NoSQL Injection, and malicious payloads

import { z } from "zod";

// =============================================================================
// SECURITY UTILITIES
// =============================================================================

/**
 * Sanitizes a string to prevent XSS and injection attacks.
 * Removes/escapes potentially dangerous characters while preserving legitimate content.
 */
const sanitizeString = (str: string): string => {
    return str
        // Remove null bytes (MongoDB injection vector)
        .replace(/\0/g, "")
        // Remove MongoDB operators that could be used in NoSQL injection
        .replace(/\$(?:where|regex|gt|gte|lt|lte|ne|in|nin|or|and|not|nor|exists|type|mod|elemMatch|size)/gi, "")
        // Basic XSS prevention - escape HTML entities
        .replace(/[<>]/g, (char) => (char === "<" ? "&lt;" : "&gt;"))
        // Trim whitespace
        .trim();
};

/**
 * Custom Zod string preprocessor that sanitizes input
 */
const sanitizedString = (maxLength: number = 500) =>
    z.preprocess(
        (val) => (typeof val === "string" ? sanitizeString(val) : val),
        z.string().max(maxLength, `Maximum ${maxLength} characters allowed`)
    );

// =============================================================================
// USER AUTHENTICATION SCHEMAS
// =============================================================================

/**
 * Password complexity requirements for bank-level security:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        "Password must contain at least one special character (!@#$%^&*)"
    );

/**
 * Email validation with strict RFC 5322 compliance
 */
const emailSchema = z
    .string()
    .min(1, "Email is required")
    .max(254, "Email cannot exceed 254 characters")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim())
    // Additional security: prevent email header injection
    .refine(
        (email) => !email.includes("\n") && !email.includes("\r"),
        "Invalid email format"
    );

/**
 * User Registration Schema
 */
export const userRegistrationSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .regex(
            /^[a-zA-Z\s'-]+$/,
            "Name can only contain letters, spaces, hyphens, and apostrophes"
        )
        .transform((name) => sanitizeString(name)),
    email: emailSchema,
    password: passwordSchema,
});

/**
 * User Login Schema (less strict password validation since we're just checking)
 */
export const userLoginSchema = z.object({
    email: emailSchema,
    password: z
        .string()
        .min(1, "Password is required")
        .max(128, "Invalid password"),
});

// =============================================================================
// RESUME SCHEMAS
// =============================================================================

/**
 * Personal Information Schema
 */
export const personalInfoSchema = z.object({
    fullName: sanitizedString(100)
        .optional()
        .default("")
        .transform((val) => val || ""),
    email: z
        .string()
        .email("Invalid email format")
        .max(254, "Email too long")
        .or(z.literal(""))
        .optional()
        .default("")
        .transform((val) => (val ? val.toLowerCase().trim() : "")),
    github: sanitizedString(200)
        .optional()
        .default("")
        .transform((val) => val || ""),
    linkedin: sanitizedString(200)
        .optional()
        .default("")
        .transform((val) => val || ""),
    phone: z
        .string()
        .max(20, "Phone number too long")
        .regex(
            /^[\d\s\-\+\(\)]*$/,
            "Phone can only contain numbers, spaces, and common separators"
        )
        .or(z.literal(""))
        .optional()
        .default("")
        .transform((val) => (val ? val.trim() : "")),
    summary: sanitizedString(2000)
        .optional()
        .default("")
        .transform((val) => val || ""),
});

/**
 * Education Entry Schema
 */
const educationSchema = z.object({
    school: sanitizedString(200),
    degree: sanitizedString(200),
    start: sanitizedString(50),
    end: sanitizedString(50),
});

/**
 * Experience Entry Schema
 */
const experienceSchema = z.object({
    company: sanitizedString(200),
    role: sanitizedString(200),
    description: sanitizedString(2000), // Allow longer descriptions
    start: sanitizedString(50),
    end: sanitizedString(50),
});

/**
 * Project Entry Schema
 */
const projectSchema = z.object({
    title: sanitizedString(200),
    description: sanitizedString(2000),
    techStack: z
        .array(sanitizedString(100))
        .max(20, "Maximum 20 technologies allowed")
        .default([]),
    link: sanitizedString(500).default(""),
});

/**
 * Complete Resume Schema
 * Includes array length limits to prevent payload overflow attacks
 */
export const resumeSchema = z.object({
    title: sanitizedString(200)
        .optional()
        .default("Untitled Resume"),
    templateId: z.enum(["latex", "modern"]).optional(),
    theme: z.enum(["cyber", "terminal", "minimal"]).optional().default("cyber"),
    isPrimary: z.boolean().optional().default(false),
    isPublic: z.boolean().optional().default(false),
    slug: z
        .string()
        .max(100, "Slug cannot exceed 100 characters")
        .regex(
            /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
            "Slug must be lowercase, alphanumeric, and can contain hyphens (not at start/end)"
        )
        .optional()
        .or(z.literal("").transform(() => undefined)),
    personal: personalInfoSchema.optional().default({
        fullName: "",
        email: "",
        github: "",
        linkedin: "",
        phone: "",
        summary: "",
    }),
    education: z
        .array(educationSchema)
        .max(10, "Maximum 10 education entries allowed")
        .default([]),
    experience: z
        .array(experienceSchema)
        .max(20, "Maximum 20 experience entries allowed")
        .default([]),
    projects: z
        .array(projectSchema)
        .max(20, "Maximum 20 project entries allowed")
        .default([]),
    skills: z
        .array(sanitizedString(100))
        .max(50, "Maximum 50 skills allowed")
        .default([]),
});

/**
 * Partial Resume Schema for updates (all fields optional)
 */
export const resumeUpdateSchema = resumeSchema.partial();

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Formats Zod errors into user-friendly messages
 * Avoids leaking system details while being helpful
 */
export function formatZodError(error: z.ZodError): {
    message: string;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        // Use user-friendly message, don't expose internal details
        errors[path] = issue.message;
    });

    return {
        message: "Validation failed. Please check your input.",
        errors,
    };
}

/**
 * Safe parse wrapper that returns a consistent response structure
 */
export function safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): {
    success: boolean;
    data?: T;
    error?: { message: string; errors: Record<string, string> };
} {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return {
        success: false,
        error: formatZodError(result.error),
    };
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type ResumeInput = z.infer<typeof resumeSchema>;
export type ResumeUpdateInput = z.infer<typeof resumeUpdateSchema>;

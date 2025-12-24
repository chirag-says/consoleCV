// ConsoleCV - Resume Extraction Schema
// Zod schema for validating AI-extracted resume data

import { z } from "zod";

// =============================================================================
// PERSONAL INFO SCHEMA
// =============================================================================

export const aiPersonalInfoSchema = z.object({
    fullName: z.string().nullable().optional().transform((v) => v || ""),
    email: z.string().nullable().optional().transform((v) => v || ""),
    phone: z.string().nullable().optional().transform((v) => v || ""),
    github: z.string().nullable().optional().transform((v) => v || ""),
    linkedin: z.string().nullable().optional().transform((v) => v || ""),
    summary: z.string().nullable().optional().transform((v) => v || ""),
});

// =============================================================================
// EDUCATION SCHEMA
// =============================================================================

export const aiEducationSchema = z.object({
    school: z.string().nullable().optional().transform((v) => v || ""),
    degree: z.string().nullable().optional().transform((v) => v || ""),
    startDate: z.string().nullable().optional().transform((v) => v || ""),
    endDate: z.string().nullable().optional().transform((v) => v || ""),
    gpa: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
});

// =============================================================================
// EXPERIENCE SCHEMA
// =============================================================================

export const aiExperienceSchema = z.object({
    company: z.string().nullable().optional().transform((v) => v || ""),
    role: z.string().nullable().optional().transform((v) => v || ""),
    startDate: z.string().nullable().optional().transform((v) => v || ""),
    endDate: z.string().nullable().optional().transform((v) => v || ""),
    description: z.string().nullable().optional().transform((v) => v || ""),
});

// =============================================================================
// PROJECT SCHEMA
// =============================================================================

export const aiProjectSchema = z.object({
    name: z.string().nullable().optional().transform((v) => v || ""),
    description: z.string().nullable().optional().transform((v) => v || ""),
    techStack: z.array(z.string()).nullable().optional().default([]),
    link: z.string().nullable().optional().transform((v) => v || ""),
});

// =============================================================================
// FULL RESUME SCHEMA
// =============================================================================

export const aiResumeExtractionSchema = z.object({
    personalInfo: aiPersonalInfoSchema.nullable().optional(),
    education: z.array(aiEducationSchema).nullable().optional().default([]),
    experience: z.array(aiExperienceSchema).nullable().optional().default([]),
    skills: z.array(z.string()).nullable().optional().default([]),
    projects: z.array(aiProjectSchema).nullable().optional().default([]),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type AIPersonalInfo = z.infer<typeof aiPersonalInfoSchema>;
export type AIEducation = z.infer<typeof aiEducationSchema>;
export type AIExperience = z.infer<typeof aiExperienceSchema>;
export type AIProject = z.infer<typeof aiProjectSchema>;
export type AIResumeExtraction = z.infer<typeof aiResumeExtractionSchema>;

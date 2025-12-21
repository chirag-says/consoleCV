// ConsoleCV - Mongoose Resume Model
// Defines the MongoDB schema for storing resume data

import mongoose, { Schema, Document, Model } from "mongoose";
import type { ResumeData } from "@/types/resume";

// Document interface extending ResumeData with Mongoose Document properties
export interface IResume extends Omit<ResumeData, "_id" | "userId">, Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    templateId: "latex" | "modern";
    createdAt: Date;
    updatedAt: Date;
}

// Personal Info Sub-Schema
const PersonalSchema = new Schema(
    {
        fullName: { type: String, default: "" },
        email: { type: String, default: "" },
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        phone: { type: String, default: "" },
    },
    { _id: false }
);

// Education Sub-Schema
const EducationSchema = new Schema(
    {
        school: { type: String, required: true },
        degree: { type: String, required: true },
        start: { type: String, required: true },
        end: { type: String, required: true },
    },
    { _id: false }
);

// Experience Sub-Schema
const ExperienceSchema = new Schema(
    {
        company: { type: String, required: true },
        role: { type: String, required: true },
        description: { type: String, default: "" },
        start: { type: String, required: true },
        end: { type: String, required: true },
    },
    { _id: false }
);

// Project Sub-Schema
const ProjectSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        techStack: { type: [String], default: [] },
        link: { type: String, default: "" },
    },
    { _id: false }
);

// Main Resume Schema
const ResumeSchema = new Schema<IResume>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            default: "Untitled Resume",
        },
        templateId: {
            type: String,
            enum: ["latex", "modern"],
            default: "latex",
        },
        personal: { type: PersonalSchema, default: () => ({}) },
        education: { type: [EducationSchema], default: [] },
        experience: { type: [ExperienceSchema], default: [] },
        projects: { type: [ProjectSchema], default: [] },
        skills: { type: [String], default: [] },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient user queries
ResumeSchema.index({ userId: 1, updatedAt: -1 });

// Prevent model recompilation in development
const Resume: Model<IResume> =
    mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);

export default Resume;

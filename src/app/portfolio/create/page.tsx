"use client";

// ConsoleCV - Portfolio Builder Page
// Upload resume → Parse → Preview → Generate Portfolio
// Uses the heuristic parser for client-side PDF text extraction

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Upload,
    FileText,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Rocket,
    Eye,
    Edit3,
    Trash2,
    User,
    Mail,
    Phone,
    Github,
    Linkedin,
    GraduationCap,
    Briefcase,
    FolderGit2,
    Zap,
    Palette,
    ExternalLink,
    Copy,
} from "lucide-react";
import { extractTextFromPdf, formatFileSize, isValidPdfFile } from "@/lib/pdf-parser";
import { parseResumeHeuristic, getParsingConfidence } from "@/lib/heuristic-parser";
import type { ResumeData } from "@/types/resume";
import { defaultResumeData } from "@/types/resume";

// =============================================================================
// TYPES
// =============================================================================

type BuilderStep = "upload" | "preview" | "customize" | "complete";

interface UploadedResume {
    file: File;
    text: string;
    pageCount: number;
}

interface ParsingResult {
    data: ResumeData;
    confidence: number;
    issues: string[];
}

// =============================================================================
// STEP INDICATOR COMPONENT
// =============================================================================

interface StepIndicatorProps {
    currentStep: BuilderStep;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
    const steps: { id: BuilderStep; label: string; icon: React.ReactNode }[] = [
        { id: "upload", label: "Upload", icon: <Upload className="w-4 h-4" /> },
        { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
        { id: "customize", label: "Customize", icon: <Palette className="w-4 h-4" /> },
        { id: "complete", label: "Complete", icon: <Rocket className="w-4 h-4" /> },
    ];

    const currentIndex = steps.findIndex((s) => s.id === currentStep);

    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = index < currentIndex;

                return (
                    <React.Fragment key={step.id}>
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isActive
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                : isCompleted
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-slate-800 text-slate-500 border border-slate-700"
                                }`}
                        >
                            {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                step.icon
                            )}
                            <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`w-8 h-0.5 ${isCompleted ? "bg-emerald-500" : "bg-slate-700"
                                    }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// =============================================================================
// UPLOAD STEP COMPONENT
// =============================================================================

interface UploadStepProps {
    onFileProcessed: (resume: UploadedResume, result: ParsingResult) => void;
}

function UploadStep({ onFileProcessed }: UploadStepProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File) => {
        if (!isValidPdfFile(file)) {
            setError("Please upload a valid PDF file.");
            return;
        }

        setError(null);
        setIsProcessing(true);
        setProcessingStatus("Extracting text from PDF...");

        try {
            // Step 1: Extract text from PDF
            const extraction = await extractTextFromPdf(file);

            if (!extraction.success) {
                setError(extraction.error || "Failed to extract text from PDF.");
                setIsProcessing(false);
                return;
            }

            console.log("[Upload] PDF text extracted, length:", extraction.text.length);

            // Step 2: Try AI-based parsing first
            setProcessingStatus("Analyzing with AI...");
            let parsedData = null;
            let parsingMethod = "heuristic";
            let aiError = null;

            try {
                const aiResponse = await fetch("/api/ai/parse-resume", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: extraction.text }),
                });

                const aiResult = await aiResponse.json();

                if (aiResponse.ok && aiResult.success && aiResult.data) {
                    parsedData = aiResult.data;
                    parsingMethod = "ai";
                    console.log("[Upload] AI parsing successful");
                } else {
                    aiError = aiResult.error || "AI parsing returned no data";
                    console.warn("[Upload] AI parsing failed:", aiError);
                }
            } catch (fetchError) {
                aiError = "AI service unavailable";
                console.warn("[Upload] AI fetch error:", fetchError);
            }

            // Step 3: Fallback to heuristic parsing if AI failed
            if (!parsedData) {
                setProcessingStatus("Using pattern matching...");
                console.log("[Upload] Falling back to heuristic parser");
                parsedData = parseResumeHeuristic(extraction.text);
            }

            // Calculate confidence
            const confidence = getParsingConfidence(parsedData);

            // Add parsing method info to issues
            const issues = [...confidence.details];
            if (parsingMethod === "ai") {
                issues.unshift("✨ Parsed with AI for improved accuracy");
            } else if (aiError) {
                issues.unshift(`⚠️ AI unavailable (${aiError}), used pattern matching`);
            }

            // Pass to parent
            onFileProcessed(
                {
                    file,
                    text: extraction.text,
                    pageCount: extraction.pageCount,
                },
                {
                    data: parsedData,
                    confidence: parsingMethod === "ai"
                        ? Math.max(confidence.score, 75) // AI parsing gets minimum 75% confidence
                        : confidence.score,
                    issues,
                }
            );
        } catch (err) {
            console.error("[Upload] Error:", err);
            setError("An unexpected error occurred while processing your resume.");
        } finally {
            setIsProcessing(false);
            setProcessingStatus("");
        }
    }, [onFileProcessed]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Build Your{" "}
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Portfolio
                    </span>
                </h1>
                <p className="text-slate-400 text-lg">
                    Upload your existing resume and we&apos;ll create a stunning portfolio in seconds
                </p>
            </div>

            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
                    } ${error ? "border-red-500/50" : ""}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                />

                {isProcessing ? (
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse" />
                            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        </div>
                        <p className="text-lg text-white font-medium mb-1">Processing your resume...</p>
                        <p className="text-sm text-slate-400">{processingStatus || "Extracting information..."}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-indigo-400" />
                        </div>
                        <p className="text-lg text-white font-medium mb-1">
                            Drop your resume here or{" "}
                            <span className="text-indigo-400">browse</span>
                        </p>
                        <p className="text-sm text-slate-500">
                            PDF files only • Max 10MB • Text-based PDFs work best
                        </p>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-300 font-medium">Upload Failed</p>
                        <p className="text-red-400/80 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Features */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: <Zap className="w-5 h-5" />, label: "Instant Parsing", desc: "No API costs" },
                    { icon: <Eye className="w-5 h-5" />, label: "Live Preview", desc: "See before saving" },
                    { icon: <Rocket className="w-5 h-5" />, label: "Space Theme", desc: "Stunning design" },
                ].map((feature, i) => (
                    <div
                        key={i}
                        className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center"
                    >
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mx-auto mb-2 text-indigo-400">
                            {feature.icon}
                        </div>
                        <p className="text-white font-medium text-sm">{feature.label}</p>
                        <p className="text-slate-500 text-xs">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// PREVIEW STEP COMPONENT
// =============================================================================

interface PreviewStepProps {
    uploadedResume: UploadedResume;
    parsingResult: ParsingResult;
    resumeData: ResumeData;
    onUpdateData: (data: ResumeData) => void;
    onBack: () => void;
    onContinue: () => void;
}

function PreviewStep({
    uploadedResume,
    parsingResult,
    resumeData,
    onUpdateData,
    onBack,
    onContinue,
}: PreviewStepProps) {
    const { personal, education, experience, projects, skills } = resumeData;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Review Extracted Data</h1>
                <p className="text-slate-400">
                    We extracted the following from your resume. You can edit any field before generating your portfolio.
                </p>
            </div>

            {/* Confidence Score */}
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-4 ${parsingResult.confidence >= 70
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : parsingResult.confidence >= 40
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${parsingResult.confidence >= 70
                    ? "bg-emerald-500/20 text-emerald-400"
                    : parsingResult.confidence >= 40
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                    {parsingResult.confidence}%
                </div>
                <div>
                    <p className={`font-medium ${parsingResult.confidence >= 70
                        ? "text-emerald-300"
                        : parsingResult.confidence >= 40
                            ? "text-amber-300"
                            : "text-red-300"
                        }`}>
                        {parsingResult.confidence >= 70 ? "Excellent Match" : parsingResult.confidence >= 40 ? "Partial Match" : "Low Match"}
                    </p>
                    <p className="text-slate-400 text-sm">
                        Extracted from {uploadedResume.file.name} ({formatFileSize(uploadedResume.file.size)})
                    </p>
                </div>
            </div>

            {/* Parsing Issues */}
            {parsingResult.issues.length > 0 && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-amber-300 font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Notes from parsing:
                    </p>
                    <ul className="text-amber-400/80 text-sm space-y-1">
                        {parsingResult.issues.map((issue, i) => (
                            <li key={i}>• {issue}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Data Cards */}
            <div className="space-y-4">
                {/* Personal Info */}
                <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-400" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={personal.fullName}
                                onChange={(e) => onUpdateData({
                                    ...resumeData,
                                    personal: { ...personal, fullName: e.target.value }
                                })}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Email</label>
                            <input
                                type="email"
                                value={personal.email}
                                onChange={(e) => onUpdateData({
                                    ...resumeData,
                                    personal: { ...personal, email: e.target.value }
                                })}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">GitHub Username</label>
                            <input
                                type="text"
                                value={personal.github}
                                onChange={(e) => onUpdateData({
                                    ...resumeData,
                                    personal: { ...personal, github: e.target.value }
                                })}
                                placeholder="Required for portfolio URL"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">LinkedIn</label>
                            <input
                                type="text"
                                value={personal.linkedin}
                                onChange={(e) => onUpdateData({
                                    ...resumeData,
                                    personal: { ...personal, linkedin: e.target.value }
                                })}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-400" />
                        Skills ({skills.length} detected)
                    </h3>
                    {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 text-sm rounded-full border border-indigo-500/30"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No skills detected. You can add them in the editor.</p>
                    )}
                </div>

                {/* Experience */}
                <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-400" />
                        Experience ({experience.length} entries)
                    </h3>
                    {experience.length > 0 ? (
                        <div className="space-y-3">
                            {experience.map((exp, i) => (
                                <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                                    <p className="text-white font-medium">{exp.role || "Role not detected"}</p>
                                    <p className="text-indigo-400 text-sm">{exp.company || "Company not detected"}</p>
                                    <p className="text-slate-500 text-xs">{exp.start} — {exp.end || "Present"}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No experience entries detected.</p>
                    )}
                </div>

                {/* Education */}
                <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-indigo-400" />
                        Education ({education.length} entries)
                    </h3>
                    {education.length > 0 ? (
                        <div className="space-y-3">
                            {education.map((edu, i) => (
                                <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                                    <p className="text-white font-medium">{edu.school || "Institution not detected"}</p>
                                    <p className="text-indigo-400 text-sm">{edu.degree || "Degree not detected"}</p>
                                    <p className="text-slate-500 text-xs">{edu.start} — {edu.end}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No education entries detected.</p>
                    )}
                </div>

                {/* Projects */}
                <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <FolderGit2 className="w-5 h-5 text-indigo-400" />
                        Projects ({projects.length} entries)
                    </h3>
                    {projects.length > 0 ? (
                        <div className="space-y-3">
                            {projects.map((proj, i) => (
                                <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                                    <p className="text-white font-medium">{proj.title}</p>
                                    {proj.techStack.length > 0 && (
                                        <p className="text-slate-400 text-xs mt-1">
                                            {proj.techStack.join(", ")}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No projects detected.</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={onContinue}
                    disabled={!personal.github}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    Continue to Generate
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {!personal.github && (
                <p className="text-amber-400 text-sm text-center mt-3">
                    ⚠️ GitHub username is required for your portfolio URL
                </p>
            )}
        </div>
    );
}

// =============================================================================
// CUSTOMIZE STEP COMPONENT
// =============================================================================

interface CustomizeStepProps {
    resumeData: ResumeData;
    onBack: () => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

function CustomizeStep({ resumeData, onBack, onGenerate, isGenerating }: CustomizeStepProps) {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Choose Your Theme</h1>
                <p className="text-slate-400">
                    Select a portfolio theme that matches your style
                </p>
            </div>

            {/* Theme Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Space Theme */}
                <div className="relative p-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl">
                    <div className="p-5 bg-[#030014] rounded-xl">
                        <div className="h-32 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute w-20 h-20 bg-indigo-500/30 rounded-full blur-xl" />
                            <Rocket className="w-12 h-12 text-indigo-400 relative z-10" />
                        </div>
                        <h3 className="text-white font-semibold mb-1">Deep Space</h3>
                        <p className="text-slate-400 text-sm mb-3">
                            Immersive dark theme with neon accents and starfield
                        </p>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 text-sm font-medium">Selected</span>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Themes */}
                <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl opacity-60">
                    <div className="h-32 bg-slate-800 rounded-lg mb-4 flex items-center justify-center">
                        <Palette className="w-12 h-12 text-slate-600" />
                    </div>
                    <h3 className="text-slate-400 font-semibold mb-1">More Themes</h3>
                    <p className="text-slate-500 text-sm mb-3">
                        Minimal, Corporate, and more coming soon
                    </p>
                    <span className="text-slate-500 text-sm">Coming Soon</span>
                </div>
            </div>

            {/* Portfolio URL Preview */}
            <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl mb-8">
                <h3 className="text-white font-semibold mb-3">Your Portfolio URL</h3>
                <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-slate-900 rounded-lg text-slate-300 font-mono text-sm truncate">
                        consolecv.com/<span className="text-indigo-400">{resumeData.personal.github || "username"}</span>
                    </div>
                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Copy className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Portfolio...
                        </>
                    ) : (
                        <>
                            <Rocket className="w-5 h-5" />
                            Generate Portfolio
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// COMPLETE STEP COMPONENT
// =============================================================================

interface CompleteStepProps {
    portfolioUrl: string;
}

function CompleteStep({ portfolioUrl }: CompleteStepProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(portfolioUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            {/* Success Animation */}
            <div className="mb-8">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                🎉 Portfolio Generated!
            </h1>
            <p className="text-slate-400 text-lg mb-8">
                Your stunning developer portfolio is now live
            </p>

            {/* Portfolio URL */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl mb-8">
                <p className="text-slate-400 text-sm mb-3">Your Portfolio URL</p>
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 px-4 py-3 bg-slate-900 rounded-xl text-white font-mono text-lg truncate">
                        {portfolioUrl}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-colors"
                    >
                        {isCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
                {isCopied && (
                    <p className="text-emerald-400 text-sm">✓ Copied to clipboard!</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                    <ExternalLink className="w-5 h-5" />
                    View Portfolio
                </a>
                <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function PortfolioBuilderPage() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState<BuilderStep>("upload");
    const [uploadedResume, setUploadedResume] = useState<UploadedResume | null>(null);
    const [parsingResult, setParsingResult] = useState<ParsingResult | null>(null);
    const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
    const [isGenerating, setIsGenerating] = useState(false);
    const [portfolioUrl, setPortfolioUrl] = useState("");

    // Handlers
    const handleFileProcessed = useCallback((resume: UploadedResume, result: ParsingResult) => {
        setUploadedResume(resume);
        setParsingResult(result);
        setResumeData(result.data);
        setCurrentStep("preview");
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!resumeData.personal.github) {
            alert("GitHub username is required for portfolio URL");
            return;
        }

        setIsGenerating(true);

        try {
            // Save resume to database with public visibility
            const response = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...resumeData,
                    title: `${resumeData.personal.fullName}'s Portfolio`,
                    isPublic: true,  // Make the portfolio publicly accessible
                    isPrimary: true, // Set as primary resume for this user
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save portfolio");
            }

            // Set portfolio URL
            const url = `${window.location.origin}/${resumeData.personal.github}`;
            setPortfolioUrl(url);
            setCurrentStep("complete");
        } catch (error) {
            console.error("[Generate] Error:", error);
            alert("Failed to generate portfolio. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }, [resumeData]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Portfolio Builder</span>
                        </Link>

                        <Link
                            href="/dashboard"
                            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                <StepIndicator currentStep={currentStep} />

                {currentStep === "upload" && (
                    <UploadStep onFileProcessed={handleFileProcessed} />
                )}

                {currentStep === "preview" && uploadedResume && parsingResult && (
                    <PreviewStep
                        uploadedResume={uploadedResume}
                        parsingResult={parsingResult}
                        resumeData={resumeData}
                        onUpdateData={setResumeData}
                        onBack={() => setCurrentStep("upload")}
                        onContinue={() => setCurrentStep("customize")}
                    />
                )}

                {currentStep === "customize" && (
                    <CustomizeStep
                        resumeData={resumeData}
                        onBack={() => setCurrentStep("preview")}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />
                )}

                {currentStep === "complete" && (
                    <CompleteStep portfolioUrl={portfolioUrl} />
                )}
            </main>
        </div>
    );
}

"use client";

// ConsoleCV - Standalone ATS Checker Page
// Universal ATS scanner accessible from the dashboard
// Supports any PDF resume comparison against job descriptions

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Target,
    AlertTriangle,
    CheckCircle2,
    Lightbulb,
    Loader2,
    Sparkles,
    Upload,
    File,
    Trash2,
    Terminal,
} from "lucide-react";
import {
    calculateMatchFromText,
    getScoreColor,
    getScoreLabel,
    type ATSAnalysisResult,
} from "@/lib/ats-logic";
import {
    extractTextFromPdf,
    formatFileSize,
    isValidPdfFile,
} from "@/lib/pdf-parser";

// =============================================================================
// TYPES
// =============================================================================

interface UploadedFile {
    file: File;
    text: string;
    pageCount: number;
}

// =============================================================================
// SCORE GAUGE COMPONENT
// =============================================================================

function ScoreGauge({ score, size = 180 }: { score: number; size?: number }) {
    const colors = getScoreColor(score);
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const dashOffset = circumference - progress;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-800"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#atsGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient id="atsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop
                            offset="0%"
                            className={score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-red-500"}
                            stopColor="currentColor"
                        />
                        <stop
                            offset="100%"
                            className={score >= 70 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-rose-400"}
                            stopColor="currentColor"
                        />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${colors.text}`}>{score}</span>
                <span className="text-sm text-slate-400 mt-1">ATS Score</span>
            </div>
        </div>
    );
}

// =============================================================================
// KEYWORD BADGE COMPONENT
// =============================================================================

function KeywordBadge({ keyword, variant }: { keyword: string; variant: "matched" | "missing" }) {
    if (variant === "matched") {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {keyword}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {keyword}
        </span>
    );
}

// =============================================================================
// FILE DROP ZONE COMPONENT
// =============================================================================

interface FileDropZoneProps {
    onFileSelect: (file: File) => void;
    isLoading: boolean;
    uploadedFile: UploadedFile | null;
    onRemoveFile: () => void;
    error: string | null;
}

function FileDropZone({ onFileSelect, isLoading, uploadedFile, onRemoveFile, error }: FileDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (files.length > 0 && isValidPdfFile(files[0])) {
            onFileSelect(files[0]);
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
    }, [onFileSelect]);

    if (uploadedFile) {
        return (
            <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                            <File className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-base font-medium text-white truncate max-w-[300px]">
                                {uploadedFile.file.name}
                            </p>
                            <p className="text-sm text-slate-400">
                                {formatFileSize(uploadedFile.file.size)} • {uploadedFile.pageCount} page{uploadedFile.pageCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onRemoveFile}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">
                        {uploadedFile.text.split(/\s+/).length} words extracted successfully
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${isDragging
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-slate-700 hover:border-slate-600 bg-slate-800/30"
                    }
                    ${error ? "border-red-500/50" : ""}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                />

                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-3" />
                        <p className="text-base text-slate-300">Extracting text from PDF...</p>
                        <p className="text-sm text-slate-500 mt-1">This may take a moment</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-lg text-slate-300 mb-1">
                            Drop your resume PDF here
                        </p>
                        <p className="text-sm text-slate-500">
                            or <span className="text-violet-400 hover:text-violet-300">click to browse</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-3">
                            Maximum 10MB • Text-based PDFs only
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function ATSCheckerPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ATSAnalysisResult | null>(null);
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileSelect = useCallback(async (file: File) => {
        setUploadError(null);
        setIsExtracting(true);
        setResult(null);

        const extractionResult = await extractTextFromPdf(file);

        if (extractionResult.success) {
            setUploadedFile({
                file,
                text: extractionResult.text,
                pageCount: extractionResult.pageCount,
            });
        } else {
            setUploadError(extractionResult.error || "Failed to extract text");
        }

        setIsExtracting(false);
    }, []);

    const handleRemoveFile = useCallback(() => {
        setUploadedFile(null);
        setUploadError(null);
        setResult(null);
    }, []);

    const handleAnalyze = useCallback(() => {
        if (!jobDescription.trim() || !uploadedFile) return;

        setIsAnalyzing(true);

        setTimeout(() => {
            const analysisResult = calculateMatchFromText(uploadedFile.text, jobDescription);
            setResult(analysisResult);
            setIsAnalyzing(false);
        }, 500);
    }, [jobDescription, uploadedFile]);

    const handleClear = useCallback(() => {
        setJobDescription("");
        setResult(null);
    }, []);

    const colors = result ? getScoreColor(result.score) : null;
    const label = result ? getScoreLabel(result.score) : null;
    const canAnalyze = jobDescription.trim() && uploadedFile;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Navigation */}
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">Universal ATS Checker</h1>
                                    <p className="text-xs text-slate-400">Score any resume against any job</p>
                                </div>
                            </div>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white">
                            <Terminal className="w-5 h-5" />
                            <span className="text-sm">ConsoleCV</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-3">
                        Check Your Resume&apos;s ATS Compatibility
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Upload any PDF resume and paste a job description to see how well they match.
                        100% private - all analysis happens in your browser.
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Inputs */}
                    <div className="space-y-6">
                        {/* Step 1: Upload Resume */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                                    1
                                </div>
                                <h3 className="text-lg font-semibold text-white">Upload Resume PDF</h3>
                            </div>
                            <FileDropZone
                                onFileSelect={handleFileSelect}
                                isLoading={isExtracting}
                                uploadedFile={uploadedFile}
                                onRemoveFile={handleRemoveFile}
                                error={uploadError}
                            />
                        </div>

                        {/* Step 2: Job Description */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                                    2
                                </div>
                                <h3 className="text-lg font-semibold text-white">Paste Job Description</h3>
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the full job description here including requirements, qualifications, and responsibilities..."
                                className="w-full h-48 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Analyze Button */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAnalyze}
                                disabled={!canAnalyze || isAnalyzing}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 text-lg"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Analyze Match
                                    </>
                                )}
                            </button>
                            {result && (
                                <button
                                    onClick={handleClear}
                                    className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Tips */}
                        {!result && (
                            <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-violet-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-300 font-medium mb-2">Tips for best results:</p>
                                        <ul className="text-sm text-slate-400 space-y-1">
                                            <li>• Upload a text-based PDF (not a scanned image)</li>
                                            <li>• Include the full job description, not just the title</li>
                                            <li>• Modern ATS-friendly resume formats work best</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Results */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px]">
                        {result ? (
                            <div className="space-y-6">
                                {/* Score Display */}
                                <div className="flex flex-col items-center py-6">
                                    <ScoreGauge score={result.score} />
                                    <p className={`mt-4 text-xl font-semibold ${colors?.text}`}>
                                        {label}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {result.matchedKeywords.length} of {result.jobKeywords.length} keywords matched
                                    </p>
                                </div>

                                {/* Missing Keywords */}
                                {result.missingKeywords.length > 0 && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <h3 className="text-sm font-medium text-red-300 mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Missing Keywords ({result.missingKeywords.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingKeywords.slice(0, 15).map((keyword) => (
                                                <KeywordBadge key={keyword} keyword={keyword} variant="missing" />
                                            ))}
                                            {result.missingKeywords.length > 15 && (
                                                <span className="text-xs text-slate-400 self-center">
                                                    +{result.missingKeywords.length - 15} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Matched Keywords */}
                                {result.matchedKeywords.length > 0 && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <h3 className="text-sm font-medium text-emerald-300 mb-3 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Matched Keywords ({result.matchedKeywords.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.matchedKeywords.slice(0, 15).map((keyword) => (
                                                <KeywordBadge key={keyword} keyword={keyword} variant="matched" />
                                            ))}
                                            {result.matchedKeywords.length > 15 && (
                                                <span className="text-xs text-slate-400 self-center">
                                                    +{result.matchedKeywords.length - 15} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {result.suggestions.length > 0 && (
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <h3 className="text-sm font-medium text-amber-300 mb-3 flex items-center gap-2">
                                            <Lightbulb className="w-4 h-4" />
                                            Suggestions
                                        </h3>
                                        <ul className="space-y-2">
                                            {result.suggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-slate-300 pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-amber-400"
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
                                    <Target className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                    Results Will Appear Here
                                </h3>
                                <p className="text-sm text-slate-500 max-w-sm">
                                    Upload a resume PDF and paste a job description, then click &quot;Analyze Match&quot; to see your ATS compatibility score.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Privacy Notice */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        🔒 Your documents never leave your browser. All analysis is performed locally.
                    </p>
                </div>
            </main>
        </div>
    );
}

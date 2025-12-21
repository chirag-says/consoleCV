"use client";

// ConsoleCV - ATS Analyzer Component
// Compares resume against job descriptions and provides match scoring
// Supports both current project analysis and external PDF upload
// 100% client-side analysis with visual feedback

import React, { useState, useCallback, useRef } from "react";
import {
    X,
    Search,
    Target,
    AlertTriangle,
    CheckCircle2,
    Lightbulb,
    Loader2,
    FileText,
    Sparkles,
    Upload,
    File,
    Trash2,
    Zap,
} from "lucide-react";
import type { ResumeData } from "@/types/resume";
import {
    calculateMatch,
    calculateMatchFromText,
    getScoreColor,
    getScoreLabel,
    flattenResumeData,
    type ATSAnalysisResult,
} from "@/lib/ats-logic";
import {
    extractTextFromPdf,
    formatFileSize,
    isValidPdfFile,
} from "@/lib/pdf-parser";
import {
    parseResumeHeuristic,
    getParsingConfidence,
} from "@/lib/heuristic-parser";

// =============================================================================
// TYPES
// =============================================================================

interface AtsAnalyzerProps {
    resumeData: ResumeData;
    isOpen: boolean;
    onClose: () => void;
    onImportData?: (data: ResumeData) => void; // Optional callback for Smart Import
}

type AnalysisMode = "current" | "upload";

interface UploadedFile {
    file: File;
    text: string;
    pageCount: number;
}

// =============================================================================
// SCORE GAUGE COMPONENT
// =============================================================================

interface ScoreGaugeProps {
    score: number;
    size?: number;
}

function ScoreGauge({ score, size = 140 }: ScoreGaugeProps) {
    const colors = getScoreColor(score);
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const dashOffset = circumference - progress;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-700"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-1000 ease-out"
                />
                {/* Gradient definition */}
                <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
            {/* Score text in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${colors.text}`}>
                    {score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
            </div>
        </div>
    );
}

// =============================================================================
// KEYWORD BADGE COMPONENT
// =============================================================================

interface KeywordBadgeProps {
    keyword: string;
    variant: "matched" | "missing";
}

function KeywordBadge({ keyword, variant }: KeywordBadgeProps) {
    const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";

    if (variant === "matched") {
        return (
            <span className={`${baseClasses} bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`}>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {keyword}
            </span>
        );
    }

    return (
        <span className={`${baseClasses} bg-red-500/20 text-red-300 border border-red-500/30`}>
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
            <div className="p-4 bg-slate-800 border border-slate-600 rounded-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                            <File className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white truncate max-w-[200px]">
                                {uploadedFile.file.name}
                            </p>
                            <p className="text-xs text-slate-400">
                                {formatFileSize(uploadedFile.file.size)} • {uploadedFile.pageCount} page{uploadedFile.pageCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onRemoveFile}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400">
                        {uploadedFile.text.split(/\s+/).length} words extracted
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
                    relative p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${isDragging
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-slate-600 hover:border-slate-500 bg-slate-800/50"
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
                        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-2" />
                        <p className="text-sm text-slate-300">Extracting text...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-300 mb-1">
                            Drop your PDF here or <span className="text-violet-400">browse</span>
                        </p>
                        <p className="text-xs text-slate-500">
                            Max 10MB • Text-based PDFs only
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AtsAnalyzer({ resumeData, isOpen, onClose, onImportData }: AtsAnalyzerProps) {
    const [mode, setMode] = useState<AnalysisMode>("current");
    const [jobDescription, setJobDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ATSAnalysisResult | null>(null);

    // Upload mode state
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Smart Import state
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: boolean; message: string; confidence?: number } | null>(null);

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
        if (!jobDescription.trim()) return;

        setIsAnalyzing(true);

        setTimeout(() => {
            let analysisResult: ATSAnalysisResult;

            if (mode === "current") {
                // Use the structured resume data
                analysisResult = calculateMatch(resumeData, jobDescription);
            } else {
                // Use the extracted PDF text
                if (!uploadedFile) {
                    setIsAnalyzing(false);
                    return;
                }
                analysisResult = calculateMatchFromText(uploadedFile.text, jobDescription);
            }

            setResult(analysisResult);
            setIsAnalyzing(false);
        }, 500);
    }, [jobDescription, resumeData, mode, uploadedFile]);

    const handleClear = useCallback(() => {
        setJobDescription("");
        setResult(null);
    }, []);

    const handleModeChange = useCallback((newMode: AnalysisMode) => {
        setMode(newMode);
        setResult(null);
        setImportResult(null);
    }, []);

    // Smart Import handler - parses PDF text into structured resume data
    const handleSmartImport = useCallback(() => {
        if (!uploadedFile || !onImportData) return;

        setIsImporting(true);
        setImportResult(null);

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            try {
                // Parse the PDF text using our heuristic parser
                const parsedData = parseResumeHeuristic(uploadedFile.text);
                const confidence = getParsingConfidence(parsedData);

                // Import the parsed data to the editor
                onImportData(parsedData);

                // Show success message with confidence score
                setImportResult({
                    success: true,
                    message: `Resume imported successfully! (${confidence.score}% confidence)`,
                    confidence: confidence.score,
                });

                // Log any parsing issues for debugging
                if (confidence.details.length > 0) {
                    console.log("[Smart Import] Parsing notes:", confidence.details);
                }
            } catch (error) {
                console.error("[Smart Import] Error:", error);
                setImportResult({
                    success: false,
                    message: "Failed to parse resume. Please check the PDF content.",
                });
            } finally {
                setIsImporting(false);
            }
        }, 100);
    }, [uploadedFile, onImportData]);

    if (!isOpen) return null;

    const colors = result ? getScoreColor(result.score) : null;
    const label = result ? getScoreLabel(result.score) : null;
    const canAnalyze = jobDescription.trim() && (mode === "current" || uploadedFile);

    // Get resume preview text for current mode
    const currentResumePreview = mode === "current"
        ? flattenResumeData(resumeData).slice(0, 150) + "..."
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">ATS Keyword Analyzer</h2>
                            <p className="text-xs text-slate-400">Compare resume against job descriptions</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mode Tabs */}
                <div className="px-6 pt-4">
                    <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                        <button
                            onClick={() => handleModeChange("current")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${mode === "current"
                                ? "bg-violet-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Check Current Project
                        </button>
                        <button
                            onClick={() => handleModeChange("upload")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${mode === "upload"
                                ? "bg-violet-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Upload className="w-4 h-4" />
                            Upload External Resume
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Input */}
                        <div className="space-y-4">
                            {/* Resume Source */}
                            {mode === "current" ? (
                                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Analyzing your current project:</p>
                                    <p className="text-sm text-slate-300 font-medium">
                                        {resumeData.personal?.fullName || "Untitled Resume"}
                                    </p>
                                    {currentResumePreview && (
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {currentResumePreview}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <FileDropZone
                                    onFileSelect={handleFileSelect}
                                    isLoading={isExtracting}
                                    uploadedFile={uploadedFile}
                                    onRemoveFile={handleRemoveFile}
                                    error={uploadError}
                                />
                            )}

                            {/* Smart Import Button - Only shows in upload mode with a file */}
                            {mode === "upload" && uploadedFile && onImportData && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleSmartImport}
                                        disabled={isImporting}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        {isImporting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Parsing Resume...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4" />
                                                Smart Import (Free)
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-slate-500 text-center">
                                        Import this PDF directly into your current project
                                    </p>

                                    {/* Import Result Feedback */}
                                    {importResult && (
                                        <div
                                            className={`p-3 rounded-lg flex items-center gap-2 ${importResult.success
                                                    ? "bg-emerald-500/10 border border-emerald-500/20"
                                                    : "bg-red-500/10 border border-red-500/20"
                                                }`}
                                        >
                                            {importResult.success ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            )}
                                            <span
                                                className={`text-xs ${importResult.success
                                                        ? "text-emerald-300"
                                                        : "text-red-300"
                                                    }`}
                                            >
                                                {importResult.message}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Job Description Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Job Description
                                </label>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here..."
                                    className="w-full h-40 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!canAnalyze || isAnalyzing}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4" />
                                            Analyze Match
                                        </>
                                    )}
                                </button>
                                {result && (
                                    <button
                                        onClick={handleClear}
                                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Tips */}
                            {!result && (
                                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-violet-400 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="text-slate-300 font-medium mb-2">Tips for best results:</p>
                                            <ul className="text-slate-400 space-y-1 text-xs">
                                                {mode === "current" ? (
                                                    <>
                                                        <li>• Make sure your Skills section is complete</li>
                                                        <li>• Use specific technical terms in experience</li>
                                                        <li>• Include the full job description</li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li>• Upload a text-based PDF (not scanned)</li>
                                                        <li>• Ensure the PDF isn&apos;t password protected</li>
                                                        <li>• Modern ATS-friendly formats work best</li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Results */}
                        <div className="space-y-4">
                            {result ? (
                                <>
                                    {/* Score Display */}
                                    <div className="flex flex-col items-center p-5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl">
                                        <ScoreGauge score={result.score} />
                                        <p className={`mt-3 text-lg font-semibold ${colors?.text}`}>
                                            {label}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
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
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.missingKeywords.slice(0, 10).map((keyword) => (
                                                    <KeywordBadge
                                                        key={keyword}
                                                        keyword={keyword}
                                                        variant="missing"
                                                    />
                                                ))}
                                                {result.missingKeywords.length > 10 && (
                                                    <span className="text-xs text-slate-400 self-center ml-1">
                                                        +{result.missingKeywords.length - 10} more
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
                                                Matched ({result.matchedKeywords.length})
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.matchedKeywords.slice(0, 10).map((keyword) => (
                                                    <KeywordBadge
                                                        key={keyword}
                                                        keyword={keyword}
                                                        variant="matched"
                                                    />
                                                ))}
                                                {result.matchedKeywords.length > 10 && (
                                                    <span className="text-xs text-slate-400 self-center ml-1">
                                                        +{result.matchedKeywords.length - 10} more
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
                                                        className="text-xs text-slate-300 pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-amber-400"
                                                    >
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Empty state
                                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                                        <Target className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-400 mb-2">
                                        No Analysis Yet
                                    </h3>
                                    <p className="text-sm text-slate-500 max-w-xs">
                                        {mode === "current"
                                            ? "Paste a job description and click \"Analyze Match\" to compare with your current project."
                                            : "Upload a PDF resume and paste a job description to analyze the match."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/50">
                    <p className="text-xs text-slate-500 text-center">
                        💡 100% client-side analysis. Your data never leaves your browser.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AtsAnalyzer;

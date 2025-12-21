"use client";

// ConsoleCV - ATS Analyzer Component
// Compares resume against job descriptions and provides match scoring
// 100% client-side analysis with visual feedback

import React, { useState, useCallback } from "react";
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
} from "lucide-react";
import type { ResumeData } from "@/types/resume";
import {
    calculateMatch,
    getScoreColor,
    getScoreLabel,
    type ATSAnalysisResult,
} from "@/lib/ats-logic";

// =============================================================================
// TYPES
// =============================================================================

interface AtsAnalyzerProps {
    resumeData: ResumeData;
    isOpen: boolean;
    onClose: () => void;
}

// =============================================================================
// SCORE GAUGE COMPONENT
// =============================================================================

interface ScoreGaugeProps {
    score: number;
    size?: number;
}

function ScoreGauge({ score, size = 160 }: ScoreGaugeProps) {
    const colors = getScoreColor(score);
    const strokeWidth = 12;
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
                <span className={`text-4xl font-bold ${colors.text}`}>
                    {score}
                </span>
                <span className="text-xs text-slate-400 mt-1">out of 100</span>
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
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all";

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
// MAIN COMPONENT
// =============================================================================

export function AtsAnalyzer({ resumeData, isOpen, onClose }: AtsAnalyzerProps) {
    const [jobDescription, setJobDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ATSAnalysisResult | null>(null);

    const handleAnalyze = useCallback(() => {
        if (!jobDescription.trim()) return;

        setIsAnalyzing(true);

        // Simulate slight delay for better UX
        setTimeout(() => {
            const analysisResult = calculateMatch(resumeData, jobDescription);
            setResult(analysisResult);
            setIsAnalyzing(false);
        }, 500);
    }, [jobDescription, resumeData]);

    const handleClear = useCallback(() => {
        setJobDescription("");
        setResult(null);
    }, []);

    if (!isOpen) return null;

    const colors = result ? getScoreColor(result.score) : null;
    const label = result ? getScoreLabel(result.score) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">ATS Keyword Analyzer</h2>
                            <p className="text-xs text-slate-400">Compare your resume against job descriptions</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Input */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Paste Job Description
                                </label>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the full job description here. Include requirements, qualifications, and responsibilities for best results..."
                                    className="w-full h-64 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!jobDescription.trim() || isAnalyzing}
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

                            {/* Tips when no result */}
                            {!result && (
                                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-violet-400 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="text-slate-300 font-medium mb-2">Tips for best results:</p>
                                            <ul className="text-slate-400 space-y-1 text-xs">
                                                <li>• Include the full job description, not just the title</li>
                                                <li>• Make sure your resume has a complete Skills section</li>
                                                <li>• Use specific technical terms in your experience</li>
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
                                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl">
                                        <ScoreGauge score={result.score} />
                                        <p className={`mt-4 text-lg font-semibold ${colors?.text}`}>
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
                                                Critical Missing Keywords ({result.missingKeywords.length})
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {result.missingKeywords.slice(0, 12).map((keyword) => (
                                                    <KeywordBadge
                                                        key={keyword}
                                                        keyword={keyword}
                                                        variant="missing"
                                                    />
                                                ))}
                                                {result.missingKeywords.length > 12 && (
                                                    <span className="text-xs text-slate-400 self-center">
                                                        +{result.missingKeywords.length - 12} more
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
                                                {result.matchedKeywords.slice(0, 12).map((keyword) => (
                                                    <KeywordBadge
                                                        key={keyword}
                                                        keyword={keyword}
                                                        variant="matched"
                                                    />
                                                ))}
                                                {result.matchedKeywords.length > 12 && (
                                                    <span className="text-xs text-slate-400 self-center">
                                                        +{result.matchedKeywords.length - 12} more
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
                                        Paste a job description and click &quot;Analyze Match&quot; to see how well your resume aligns.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/50">
                    <p className="text-xs text-slate-500 text-center">
                        💡 This analysis runs entirely in your browser. No data is sent to any server.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AtsAnalyzer;

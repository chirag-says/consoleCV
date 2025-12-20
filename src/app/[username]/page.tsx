"use client";

// ConsoleCV - Public Resume Link
// Read-only view of a user's resume

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Loader2, Download, AlertCircle, Share2, Copy } from "lucide-react";
import ResumePreview from "@/components/preview/ResumePreview";
import type { ResumeData } from "@/types/resume";

export default function PublicResumePage() {
    const params = useParams();
    const username = params.username as string;

    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // Fetch public resume
    useEffect(() => {
        const fetchResume = async () => {
            try {
                const res = await fetch(`/api/public/${username}`);
                if (!res.ok) {
                    throw new Error("Resume not found");
                }
                const data = await res.json();
                setResumeData(data.data);
            } catch {
                setError("User not found or no public resume available.");
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchResume();
        }
    }, [username]);

    // Ref for print
    const resumeRef = useRef<HTMLDivElement>(null);

    // React-to-print hook
    const handlePrint = useReactToPrint({
        contentRef: resumeRef,
        documentTitle: `${username}_Resume_ConsoleCV`,
    });

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error || !resumeData) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
                <div className="p-4 bg-red-500/10 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Resume Not Found</h1>
                <p className="text-slate-400 mb-8">{error}</p>
                <a
                    href="/"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
                >
                    Create Your Own Resume
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {resumeData.personal.fullName}&apos;s Resume
                    </h1>
                    <a
                        href="/"
                        className="text-sm text-emerald-500 hover:text-emerald-400 font-medium"
                    >
                        Built with ConsoleCV
                    </a>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                    >
                        {isCopied ? (
                            <Copy className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <Share2 className="w-4 h-4" />
                        )}
                        {isCopied ? "Copied!" : "Share"}
                    </button>
                    <button
                        onClick={() => handlePrint()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Download className="w-4 h-4" />
                        PDF
                    </button>
                </div>
            </div>

            {/* Resume Preview */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl overflow-hidden rounded-sm">
                <ResumePreview ref={resumeRef} data={resumeData} />
            </div>
        </div>
    );
}

"use client";

// ConsoleCV - Public Developer Portfolio Page
// Dynamic portfolio page that showcases a developer's resume data
// Uses the Space Theme by default with future support for multiple themes

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, Rocket } from "lucide-react";
import dynamic from "next/dynamic";
import type { ResumeData } from "@/types/resume";

// Dynamically import Theme Components to optimize bundle size
const CyberTheme = dynamic(() => import("@/components/portfolio/CyberTheme"), {
    ssr: false,
    loading: () => <PortfolioLoadingScreen />,
});

const TerminalTheme = dynamic(() => import("@/components/portfolio/TerminalTheme"), {
    ssr: false,
    loading: () => <PortfolioLoadingScreen />,
});

const MinimalTheme = dynamic(() => import("@/components/portfolio/MinimalTheme"), {
    ssr: false,
    loading: () => <PortfolioLoadingScreen />,
});

// =============================================================================
// LOADING SCREEN COMPONENT
// =============================================================================

function PortfolioLoadingScreen() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center animate-pulse">
                    <Rocket className="w-8 h-8 text-indigo-500" />
                </div>
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    <p className="text-slate-400 font-medium">Loading portfolio...</p>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// ERROR SCREEN COMPONENT
// =============================================================================

interface ErrorScreenProps {
    message: string;
    username: string;
}

function ErrorScreen({ message, username }: ErrorScreenProps) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
            <div className="max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h1>
                <p className="text-slate-400 mb-8">
                    We couldn&apos;t find a portfolio for <span className="text-indigo-400">@{username}</span>
                </p>
                <div className="flex justify-center gap-4">
                    <a href="/" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">
                        Create Portfolio
                    </a>
                    <a href="/" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium">
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function PortfolioPage() {
    const params = useParams();
    const username = params.username as string;

    // State
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user's resume data
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await fetch(`/api/public/${username}`, { cache: "no-store" });

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("This user doesn't have a public resume yet.");
                    }
                    throw new Error("Failed to load portfolio data.");
                }

                const data = await res.json();

                if (!data.success || !data.data) {
                    throw new Error("Invalid portfolio data received.");
                }

                setResumeData(data.data);
            } catch (err) {
                console.error("[Portfolio] Error:", err);
                setError(err instanceof Error ? err.message : "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchPortfolio();
        }
    }, [username]);

    // Update document title when data loads
    useEffect(() => {
        if (resumeData?.personal?.fullName) {
            document.title = `${resumeData.personal.fullName} | Developer Portfolio`;
        }
    }, [resumeData?.personal?.fullName]);

    // Loading state
    if (isLoading) {
        return <PortfolioLoadingScreen />;
    }

    // Error state
    if (error || !resumeData) {
        return <ErrorScreen message={error || "Unknown error"} username={username} />;
    }

    // Render the correct theme
    switch (resumeData.theme) {
        case "terminal":
            return <TerminalTheme data={resumeData} />;
        case "minimal":
            return <MinimalTheme data={resumeData} />;
        case "cyber":
        default:
            return <CyberTheme data={resumeData} />;
    }
}

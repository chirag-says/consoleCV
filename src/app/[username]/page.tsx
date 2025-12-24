"use client";

// ConsoleCV - Public Developer Portfolio Page
// Dynamic portfolio page that showcases a developer's resume data
// Uses the Space Theme by default with future support for multiple themes

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, Rocket } from "lucide-react";
import dynamic from "next/dynamic";
import type { ResumeData } from "@/types/resume";

// Dynamically import SpaceTheme to avoid SSR issues with framer-motion
const SpaceTheme = dynamic(
    () => import("@/components/portfolio/SpaceTheme"),
    {
        ssr: false,
        loading: () => <PortfolioLoadingScreen />,
    }
);

// =============================================================================
// LOADING SCREEN COMPONENT
// =============================================================================

function PortfolioLoadingScreen() {
    return (
        <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center">
            {/* Animated gradient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Animated logo */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center">
                        <Rocket className="w-10 h-10 text-white animate-bounce" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    <p className="text-slate-400 text-lg">Loading portfolio...</p>
                </div>

                <p className="text-slate-600 text-sm">Preparing your developer showcase</p>
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
        <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center px-4">
            {/* Animated gradient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 text-center max-w-md">
                {/* Error icon */}
                <div className="mb-8">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-red-500/30 rounded-2xl blur-xl" />
                        <div className="relative w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-red-400" />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Portfolio Not Found
                </h1>

                <p className="text-slate-400 mb-3">
                    We couldn&apos;t find a portfolio for <span className="text-indigo-400 font-medium">@{username}</span>
                </p>

                <p className="text-slate-500 text-sm mb-8">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/"
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                    >
                        Create Your Portfolio
                    </a>
                    <a
                        href="/"
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
                    >
                        Go Home
                    </a>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-slate-600 text-sm">
                    Powered by{" "}
                    <a href="/" className="text-indigo-400 hover:text-indigo-300">
                        ConsoleCV
                    </a>
                </p>
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
                const res = await fetch(`/api/public/${username}`);

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
            document.title = `${resumeData.personal.fullName} | Developer Portfolio - ConsoleCV`;
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

    // Future: Support multiple themes based on user preference
    // const ThemeComponent = getPortfolioTheme(resumeData.portfolioTemplateId);
    // return <ThemeComponent data={resumeData} />;

    // For now, use SpaceTheme as default
    return <SpaceTheme data={resumeData} />;
}

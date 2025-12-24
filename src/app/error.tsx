"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("App Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/20">
                        <AlertTriangle className="w-10 h-10 text-rose-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                    Something went wrong
                </h2>
                <p className="text-slate-400 mb-8">
                    We&apos;re sorry — an unexpected error occurred. Please refresh the page or
                    try again later.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                </div>

                {error.digest && (
                    <p className="mt-8 text-xs font-mono text-slate-600">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}

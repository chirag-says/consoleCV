"use client";

// ConsoleCV - Dashboard Settings Page
// User settings including GitHub Integration for PAT management

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
    Terminal,
    ArrowLeft,
    Github,
    Key,
    Loader2,
    Check,
    AlertCircle,
    Eye,
    EyeOff,
    LogOut,
    Settings,
    Shield,
} from "lucide-react";

// =============================================================================
// GITHUB PAT SETTINGS SECTION
// =============================================================================

function GitHubPatSettings() {
    const [pat, setPat] = useState("");
    const [showPat, setShowPat] = useState(false);
    const [hasExistingPat, setHasExistingPat] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Check if user has a saved PAT
    useEffect(() => {
        const checkPatStatus = async () => {
            try {
                const res = await fetch("/api/user/github-pat");
                const data = await res.json();
                setHasExistingPat(data.hasGitHubPat || false);
            } catch (error) {
                console.error("Failed to check PAT status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkPatStatus();
    }, []);

    const handleSavePat = async () => {
        if (!pat.trim()) {
            setMessage({ type: "error", text: "Please enter a GitHub token" });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/github-pat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ githubPat: pat }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to save token");
            }

            setHasExistingPat(true);
            setPat("");
            setMessage({ type: "success", text: "GitHub token saved successfully!" });
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Failed to save token",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemovePat = async () => {
        if (!confirm("Are you sure you want to remove your GitHub token?")) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/github-pat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ githubPat: "" }), // Empty string to remove
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to remove token");
            }

            setHasExistingPat(false);
            setMessage({ type: "success", text: "GitHub token removed successfully!" });
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Failed to remove token",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                    <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">GitHub Integration</h3>
                    <p className="text-sm text-slate-400">
                        Connect your GitHub account for faster project imports
                    </p>
                </div>
            </div>

            {/* Status */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${hasExistingPat
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-amber-500/5 border-amber-500/20"
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasExistingPat ? "bg-emerald-500/20" : "bg-amber-500/20"
                    }`}>
                    {hasExistingPat ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                </div>
                <div>
                    <p className={`text-sm font-medium ${hasExistingPat ? "text-emerald-400" : "text-amber-400"
                        }`}>
                        {hasExistingPat ? "GitHub token is configured" : "No GitHub token configured"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {hasExistingPat
                            ? "You can import projects without rate limits"
                            : "Add a token for unlimited GitHub API access"
                        }
                    </p>
                </div>
            </div>

            {/* PAT Input */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-300">
                        {hasExistingPat ? "Update GitHub Personal Access Token" : "GitHub Personal Access Token"}
                    </label>
                    <a
                        href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        Generate new token →
                    </a>
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Key className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                        type={showPat ? "text" : "password"}
                        value={pat}
                        onChange={(e) => setPat(e.target.value)}
                        placeholder={hasExistingPat ? "Enter new token to update..." : "ghp_xxxxxxxxxxxxxxxxxxxx"}
                        className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-sm"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPat(!showPat)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                        {showPat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <p className="text-xs text-slate-500">
                    Your token is encrypted before storage. We need <code className="text-slate-400">repo</code> and <code className="text-slate-400">read:user</code> scopes for importing repositories.
                </p>
            </div>

            {/* Message */}
            {message && (
                <div className={`flex items-center gap-2 p-3 rounded-xl ${message.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                    }`}>
                    {message.type === "success" ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleSavePat}
                    disabled={isSaving || !pat.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Shield className="w-4 h-4" />
                    )}
                    {hasExistingPat ? "Update Token" : "Save Token"}
                </button>

                {hasExistingPat && (
                    <button
                        onClick={handleRemovePat}
                        disabled={isSaving}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium rounded-xl transition-all"
                    >
                        Remove Token
                    </button>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// MAIN SETTINGS PAGE
// =============================================================================

export default function SettingsPage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-[#050505] relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none" />

            {/* Navigation */}
            <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <Link href="/dashboard" className="flex items-center gap-3 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-black border border-white/10 flex items-center justify-center">
                                        <Terminal className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight">
                                    Console<span className="text-slate-500">CV</span>
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400 hidden sm:block">
                                {session?.user?.email}
                            </span>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-8 h-8 text-emerald-500" />
                        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                    </div>
                    <p className="text-slate-400">
                        Manage your account settings and integrations
                    </p>
                </div>

                {/* Settings Sections */}
                <div className="space-y-8">
                    {/* GitHub Integration Section */}
                    <section className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6">
                        <GitHubPatSettings />
                    </section>

                    {/* Future Settings Sections */}
                    <section className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 opacity-50 pointer-events-none">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                            <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                                <Key className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-400">API Keys</h3>
                                <p className="text-sm text-slate-500">Manage API integrations</p>
                            </div>
                            <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
                                Coming Soon
                            </span>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

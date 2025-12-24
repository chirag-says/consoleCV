"use client";

// ConsoleCV - Career Command Center Dashboard
// Premium Bento-style dashboard with quick actions and document management

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    Terminal,
    Plus,
    FileText,
    Clock,
    Loader2,
    ExternalLink,
    Trash2,
    LogOut,
    Target,
    Github,
    Sparkles,
    ArrowRight,
    Search,
    Command,
    Pencil,
    Rocket,
    AlertCircle,
    Settings,
} from "lucide-react";
import type { ResumeData } from "@/types/resume";
import { DashboardCard } from "@/components/dashboard";

// =============================================================================
// RESUME CARD COMPONENT
// =============================================================================

interface ResumeCardProps {
    resume: ResumeData;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onRename: (id: string, newTitle: string) => Promise<void>;
}

function ResumeCard({ resume, onDelete, onRename }: ResumeCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(resume.title || "Untitled Resume");
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!title.trim() || title === resume.title) {
            setIsEditing(false);
            setTitle(resume.title || "Untitled Resume");
            return;
        }

        setIsSaving(true);
        try {
            await onRename(resume._id!, title);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to rename", error);
            setTitle(resume.title || "Untitled Resume");
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setTitle(resume.title || "Untitled Resume");
        }
    };

    return (
        <div className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                    {/* Document Icon */}
                    <Link href={`/editor/${resume._id}`} className="block relative">
                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </Link>

                    {/* Actions - Always visible on mobile, hover on desktop */}
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 sm:translate-x-2 sm:group-hover:translate-x-0">
                        {resume.personal?.github && (
                            <Link
                                href={`/${resume.personal.github}`}
                                target="_blank"
                                className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition-colors"
                                title="View Public Profile"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        )}
                        <button
                            onClick={(e) => onDelete(resume._id!, e)}
                            className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div>
                    {isEditing ? (
                        <div className="mb-2 flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={() => handleSave()}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg px-2 py-1 text-base sm:text-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                onClick={(e) => e.stopPropagation()}
                            />
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
                        </div>
                    ) : (
                        <div className="group/title flex items-center gap-2 mb-2">
                            <Link href={`/editor/${resume._id}`} className="block flex-1 min-w-0">
                                <h3 className="text-base sm:text-xl font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                                    {resume.title || "Untitled Resume"}
                                </h3>
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="opacity-0 group-hover/title:opacity-100 p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                title="Rename"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    <Link href={`/editor/${resume._id}`} className="block">
                        <p className="text-slate-500 mb-4 sm:mb-6 font-mono text-xs tracking-wide uppercase truncate">
                            {resume.personal?.fullName || "No Name Set"}
                        </p>

                        <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-slate-800/50">
                            <span className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                Just now
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500/80 group-hover:text-emerald-400 transition-colors bg-emerald-500/10 px-3 py-1 rounded-full">
                                Edit
                                <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN DASHBOARD PAGE
// =============================================================================

export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [resumes, setResumes] = useState<ResumeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch resumes
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await fetch("/api/resume");
                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to fetch resumes");
                }

                setResumes(data.data);
            } catch (error) {
                console.error("Failed to fetch resumes:", error);
                setError(error instanceof Error ? error.message : "Failed to load resumes");
            } finally {
                setIsLoading(false);
            }
        };

        fetchResumes();
    }, []);

    // Create new resume
    const handleCreateResume = async () => {
        setIsCreating(true);
        try {
            const res = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Untitled Resume",
                    personal: { fullName: session?.user?.name || "" },
                }),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/editor/${data.data._id}`);
            }
        } catch (error) {
            console.error("Failed to create resume:", error);
            setIsCreating(false);
        }
    };

    // Rename resume
    const handleRenameResume = async (resumeId: string, newTitle: string) => {
        try {
            const res = await fetch(`/api/resume/${resumeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle }),
            });

            if (res.ok) {
                setResumes((prev) =>
                    prev.map((r) =>
                        r._id === resumeId ? { ...r, title: newTitle } : r
                    )
                );
            } else {
                throw new Error("Failed to rename");
            }
        } catch (error) {
            console.error("Failed to rename resume:", error);
            throw error; // Re-throw to handle in UI component
        }
    };

    // Delete resume
    const handleDeleteResume = async (resumeId: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to delete this resume?")) return;

        try {
            const res = await fetch(`/api/resume/${resumeId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setResumes((prev) => prev.filter((r) => r._id !== resumeId));
            }
        } catch (error) {
            console.error("Failed to delete resume:", error);
        }
    };

    // Get first name for greeting
    const firstName = session?.user?.name?.split(" ")[0] || "Developer";

    return (
        <div className="min-h-screen bg-[#050505] relative selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Subtle Grid Background - Fixed to viewport */}
            <div className="fixed inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none" />

            {/* Navigation */}
            <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
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

                        <div className="flex items-center gap-2 sm:gap-6">
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-400 font-mono">
                                <Command className="w-3 h-3" />
                                <span>K</span>
                            </div>
                            <div className="hidden lg:block h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-400 hidden sm:block">
                                    {session?.user?.email}
                                </span>
                                <Link
                                    href="/dashboard/settings"
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    title="Settings"
                                >
                                    <Settings className="w-5 h-5" />
                                </Link>
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
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-16">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                            Hello, <span className="text-emerald-400">{firstName}</span>
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-lg max-w-xl leading-relaxed">
                            Manage your career documents and analyze job fit with our intelligent tools.
                        </p>
                    </div>

                    <div className="hidden md:flex gap-4">
                        <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                            <span className="block text-2xl font-bold text-white mb-0.5">{resumes.length}</span>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Resumes</span>
                        </div>
                        <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                            <span className="block text-2xl font-bold text-white mb-0.5">0</span>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Applications</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <section className="mb-8 sm:mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Quick Actions</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <DashboardCard
                            title="Create New Resume"
                            description="Start fresh with our guided CLI-style editor"
                            icon={Plus}
                            onClick={handleCreateResume}
                            variant="primary"
                            loading={isCreating}
                        />
                        <DashboardCard
                            title="Build Portfolio"
                            description="Upload your resume & generate a stunning portfolio"
                            icon={Rocket}
                            href="/portfolio/create"
                            variant="gradient"
                            badge="New"
                        />
                        <DashboardCard
                            title="ATS Scanner"
                            description="Optimize your resume for applicant tracking systems"
                            icon={Target}
                            href="/dashboard/ats"
                            variant="default"
                        />
                        <DashboardCard
                            title="Import from GitHub"
                            description="Generate a resume directly from your repositories"
                            icon={Github}
                            href="#"
                            variant="default"
                            badge="Coming Soon"
                            disabled
                        />
                    </div>
                </section>

                {/* Error Banner */}
                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-sm hover:text-rose-300 transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Resumes Section */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                            Recent Resumes
                        </h2>

                        <div className="relative group w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 sm:py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="border border-dashed border-slate-700/50 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/40 to-slate-900/20 p-6 sm:p-16 text-center relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

                            <div className="relative">
                                {/* Large Icon */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-xl">
                                    <div className="relative">
                                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 absolute -top-1 -right-1 animate-pulse" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                                    Ready to build your first resume?
                                </h3>

                                {/* Message */}
                                <p className="text-slate-400 text-sm sm:text-base mb-6 sm:mb-10 max-w-md mx-auto leading-relaxed">
                                    Get started in seconds with our editor or import an existing resume.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                    <button
                                        onClick={handleCreateResume}
                                        disabled={isCreating}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                                    >
                                        {isCreating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Plus className="w-5 h-5" />
                                        )}
                                        Create New Resume
                                    </button>
                                    <Link
                                        href="/portfolio/create"
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-4 bg-slate-800/50 hover:bg-slate-800 text-white font-medium rounded-xl transition-all border border-slate-700/50 hover:border-emerald-500/30"
                                    >
                                        <Rocket className="w-5 h-5 text-cyan-400" />
                                        Import Resume
                                    </Link>
                                </div>

                                {/* Quick Tips */}
                                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-800/50">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 font-medium">
                                        What you can do
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400">
                                        <span className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Multiple resumes
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                            Export as PDF
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            Portfolio page
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {resumes.map((resume) => (
                                <ResumeCard
                                    key={resume._id}
                                    resume={resume}
                                    onDelete={handleDeleteResume}
                                    onRename={handleRenameResume}
                                />
                            ))}

                            {/* Create New Card (Mini) */}
                            <button
                                onClick={handleCreateResume}
                                disabled={isCreating}
                                className="group flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-700 transition-all min-h-[220px]"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-800/80 group-hover:bg-emerald-500/20 flex items-center justify-center mb-4 transition-colors">
                                    {isCreating ? (
                                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                                    ) : (
                                        <Plus className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                    )}
                                </div>
                                <span className="font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">
                                    Create New Resume
                                </span>
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            {/* Footer */}
            <footer className="border-t border-white/10 mt-12 sm:mt-20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} ConsoleCV. Engineered for developers.
                    </p>
                    <p className="text-sm text-slate-400">
                        Designed & Built by{" "}
                        <a
                            href="https://github.com/chirag-says"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-emerald-400 transition-colors font-medium"
                        >
                            Chirag
                        </a>
                    </p>
                    <div className="flex gap-6 text-sm text-slate-400">
                        <Link href="/about" className="hover:text-emerald-400 transition-colors">About</Link>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

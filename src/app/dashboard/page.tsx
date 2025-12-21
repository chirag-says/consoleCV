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

            <div className="relative p-6">
                <div className="flex justify-between items-start mb-6">
                    {/* Document Icon */}
                    <Link href={`/editor/${resume._id}`} className="block relative">
                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                        <div className="relative w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                            <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
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
                                className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg px-2 py-1 text-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                onClick={(e) => e.stopPropagation()}
                            />
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
                        </div>
                    ) : (
                        <div className="group/title flex items-center gap-2 mb-2">
                            <Link href={`/editor/${resume._id}`} className="block flex-1">
                                <h3 className="text-xl font-medium text-slate-200 group-hover:text-white transition-colors truncate">
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
                        <p className="text-sm text-slate-500 mb-6 font-mono text-xs tracking-wide uppercase">
                            {resume.personal?.fullName || "No Name Set"}
                        </p>

                        <div className="flex items-center justify-between pt-5 border-t border-slate-800/50">
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

    // Fetch resumes
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await fetch("/api/resume");
                if (res.ok) {
                    const data = await res.json();
                    setResumes(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch resumes:", error);
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
        <div className="min-h-screen bg-[#050505] relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none" />

            {/* Navigation */}
            <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-4">
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

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-400 font-mono">
                                <Command className="w-3 h-3" />
                                <span>K</span>
                            </div>
                            <div className="h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-400 hidden sm:block">
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
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                            Hello, <span className="text-emerald-400">{firstName}</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
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
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Quick Actions</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DashboardCard
                            title="Create New Resume"
                            description="Start fresh with our guided CLI-style editor"
                            icon={Plus}
                            onClick={handleCreateResume}
                            variant="primary"
                            loading={isCreating}
                        />
                        <DashboardCard
                            title="ATS Scanner"
                            description="Optimize your resume for applicant tracking systems"
                            icon={Target}
                            href="/dashboard/ats"
                            variant="gradient"
                            badge="New"
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

                {/* Resumes Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <FileText className="w-5 h-5 text-emerald-500" />
                            Recent Resumes
                        </h2>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all w-64 placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No resumes yet
                            </h3>
                            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                                Create your first developer-style resume and start impressing recruiters.
                            </p>
                            <button
                                onClick={handleCreateResume}
                                disabled={isCreating}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {isCreating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                                Create your first resume
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <footer className="border-t border-white/5 mt-20 bg-[#020202]">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-slate-600">
                        © {new Date().getFullYear()} ConsoleCV. Engineered for developers.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

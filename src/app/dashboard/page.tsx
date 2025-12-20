"use client";

import { useState, useEffect } from "react";
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
    Edit,
} from "lucide-react";
import type { ResumeData } from "@/types/resume";

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

    // Delete resume
    const handleDeleteResume = async (resumeId: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
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

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Navigation */}
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <Terminal className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">ConsoleCV</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">
                                {session?.user?.email}
                            </span>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })} // Sign out via next-auth
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">Your Resumes</h1>
                    <button
                        onClick={handleCreateResume}
                        disabled={isCreating}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70"
                    >
                        {isCreating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        Create New Resume
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No resumes yet
                        </h3>
                        <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                            Create your first developer-style resume and start impressing
                            recruiters.
                        </p>
                        <button
                            onClick={handleCreateResume}
                            className="text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                            Create your first resume &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => (
                            <div
                                key={resume._id}
                                className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 transition-all hover:shadow-xl hover:shadow-emerald-500/10"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleDeleteResume(resume._id!, e)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <Link href={`/editor/${resume._id}`} className="block">
                                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                                        {resume.title || "Untitled Resume"}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        {resume.personal.fullName || "No Name"}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-800">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Updated just now
                                        </span>
                                        <span className="flex items-center gap-1.5 ml-auto text-emerald-400/80 hover:text-emerald-400">
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit Resume
                                        </span>
                                    </div>
                                </Link>

                                {/* Public Link Button overlay */}
                                {resume.personal?.github && (
                                    <div className="absolute top-5 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/${resume.personal.github}`}
                                            target="_blank"
                                            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors inline-block"
                                            title="View Public Link"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

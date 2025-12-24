"use client";

// ConsoleCV - GitHub Importer Component
// Full-featured component for importing projects from GitHub

import React, { useState } from "react";
import {
    Github,
    Loader2,
    X,
    AlertCircle,
    Check,
    ExternalLink,
    Settings,
    Zap,
    FolderGit2,
} from "lucide-react";
import type { Project } from "@/types/resume";
import Link from "next/link";

// =============================================================================
// TYPES
// =============================================================================

interface GitHubImportResponse {
    success: boolean;
    error?: string;
    data?: {
        projects: Project[];
        count: number;
        username: string;
        isAuthenticated: boolean;
        warning?: string;
    };
    isRateLimited?: boolean;
    requiresAuth?: boolean;
}

interface GitHubImporterProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (projects: Project[]) => void;
    defaultUsername?: string;
}

// =============================================================================
// PROJECT ITEM COMPONENT
// =============================================================================

interface ProjectItemProps {
    project: Project;
    isSelected: boolean;
    onToggle: () => void;
}

function ProjectItem({ project, isSelected, onToggle }: ProjectItemProps) {
    return (
        <div
            className={`relative p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                }`}
            onClick={onToggle}
        >
            {/* Selection indicator */}
            <div
                className={`absolute top-4 right-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-slate-500"
                    }`}
            >
                {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>

            {/* Content */}
            <div className="pr-8">
                <h4 className="font-medium text-white mb-1 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-slate-400" />
                    {project.title}
                </h4>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {project.description || "No description available"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {project.techStack.slice(0, 4).map((tech) => (
                        <span
                            key={tech}
                            className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded-md"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.techStack.length > 4 && (
                        <span className="px-2 py-0.5 text-slate-500 text-xs">
                            +{project.techStack.length - 4} more
                        </span>
                    )}
                </div>
            </div>

            {/* Link */}
            {project.link && (
                <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-4 right-4 p-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="View on GitHub"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            )}
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function GitHubImporter({
    isOpen,
    onClose,
    onImport,
    defaultUsername = "",
}: GitHubImporterProps) {
    const [username, setUsername] = useState(defaultUsername);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [requiresAuth, setRequiresAuth] = useState(false);

    // Reset state when opening
    const resetState = () => {
        setError(null);
        setWarning(null);
        setProjects([]);
        setSelectedProjects(new Set());
        setRequiresAuth(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFetch = async () => {
        if (!username.trim()) {
            setError("Please enter a GitHub username");
            return;
        }

        setIsLoading(true);
        setError(null);
        setWarning(null);
        setProjects([]);
        setSelectedProjects(new Set());
        setRequiresAuth(false);

        try {
            const response = await fetch("/api/resume/github-import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username.trim(), limit: 10 }),
            });

            const data: GitHubImportResponse = await response.json();

            if (!response.ok || !data.success) {
                if (data.isRateLimited && data.requiresAuth) {
                    setRequiresAuth(true);
                }
                throw new Error(data.error || "Failed to fetch GitHub projects");
            }

            if (data.data) {
                setProjects(data.data.projects);
                setIsAuthenticated(data.data.isAuthenticated);

                if (data.data.warning) {
                    setWarning(data.data.warning);
                }

                // Auto-select all projects by default
                setSelectedProjects(new Set(data.data.projects.map((_, i) => i)));

                if (data.data.projects.length === 0) {
                    setWarning("No public repositories found for this user.");
                }
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to fetch projects");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleProject = (index: number) => {
        const newSelected = new Set(selectedProjects);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedProjects(newSelected);
    };

    const selectAll = () => {
        setSelectedProjects(new Set(projects.map((_, i) => i)));
    };

    const deselectAll = () => {
        setSelectedProjects(new Set());
    };

    const handleImport = () => {
        const selectedProjectsList = projects.filter((_, i) => selectedProjects.has(i));
        onImport(selectedProjectsList);
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <Github className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Import from GitHub
                            </h2>
                            <p className="text-sm text-slate-400">
                                Fetch your repositories and add them as projects
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Username Input */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Github className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter GitHub username"
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                            />
                        </div>
                        <button
                            onClick={handleFetch}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium rounded-xl transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4" />
                            )}
                            Fetch
                        </button>
                    </div>

                    {/* Authentication Status */}
                    {projects.length > 0 && (
                        <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isAuthenticated
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-amber-500/10 text-amber-400"
                                }`}
                        >
                            {isAuthenticated ? (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    Using authenticated requests (5,000/hr rate limit)
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Unauthenticated (60/hr limit).{" "}
                                    <Link
                                        href="/dashboard/settings"
                                        className="underline hover:text-amber-300"
                                    >
                                        Add token in Settings
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    {/* Warning Message */}
                    {warning && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{warning}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm">{error}</p>
                                {requiresAuth && (
                                    <Link
                                        href="/dashboard/settings"
                                        className="inline-flex items-center gap-1 mt-2 text-xs text-rose-300 hover:text-rose-200 underline"
                                    >
                                        <Settings className="w-3 h-3" />
                                        Add GitHub Token in Settings
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                            <p className="text-slate-400 text-sm">Fetching repositories...</p>
                        </div>
                    )}

                    {/* Projects List */}
                    {projects.length > 0 && !isLoading && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">
                                    {selectedProjects.size} of {projects.length} selected
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={selectAll}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-slate-600">|</span>
                                    <button
                                        onClick={deselectAll}
                                        className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                {projects.map((project, index) => (
                                    <ProjectItem
                                        key={index}
                                        project={project}
                                        isSelected={selectedProjects.has(index)}
                                        onToggle={() => toggleProject(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State After Fetch */}
                    {!isLoading && projects.length === 0 && !error && username && (
                        <div className="text-center py-12">
                            <Github className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">
                                Enter a GitHub username and click Fetch to get started
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 border-t border-slate-800 bg-slate-900/50">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={selectedProjects.size === 0 || isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
                    >
                        <Check className="w-4 h-4" />
                        Add {selectedProjects.size} Project{selectedProjects.size !== 1 ? "s" : ""}
                    </button>
                </div>
            </div>
        </div>
    );
}

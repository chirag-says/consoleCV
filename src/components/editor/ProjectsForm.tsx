"use client";

// InternDeck - Projects Form Component
// Manages project entries with GitHub import functionality

import React, { useState } from "react";
import { FolderGit2, Plus, Trash2, Github, Loader2, X } from "lucide-react";
import type { Project } from "@/types/resume";
import { importGitHubProjects } from "@/lib/github";
import SmartTextarea from "@/components/ui/SmartTextarea";

interface ProjectsFormProps {
    data: Project[];
    onChange: (data: Project[]) => void;
    githubUsername?: string;
}

const emptyProject: Project = {
    title: "",
    description: "",
    techStack: [],
    link: "",
};

export default function ProjectsForm({
    data,
    onChange,
    githubUsername,
}: ProjectsFormProps) {
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importUsername, setImportUsername] = useState(githubUsername || "");

    const addProject = () => {
        onChange([...data, { ...emptyProject }]);
    };

    const removeProject = (index: number) => {
        onChange(data.filter((_, i) => i !== index));
    };

    const updateProject = (
        index: number,
        field: keyof Project,
        value: string | string[]
    ) => {
        const updated = data.map((proj, i) =>
            i === index ? { ...proj, [field]: value } : proj
        );
        onChange(updated);
    };

    const handleTechStackChange = (index: number, value: string) => {
        const techStack = value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        updateProject(index, "techStack", techStack);
    };

    const handleGitHubImport = async () => {
        if (!importUsername.trim()) {
            setImportError("Please enter a GitHub username");
            return;
        }

        setIsImporting(true);
        setImportError(null);

        try {
            const projects = await importGitHubProjects(importUsername.trim(), 6);
            if (projects.length === 0) {
                setImportError("No public repositories found for this user");
                return;
            }
            onChange([...data, ...projects]);
            setShowImportModal(false);
            setImportUsername("");
        } catch (error) {
            setImportError(
                error instanceof Error ? error.message : "Failed to import projects"
            );
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-cyan-400" />
                    Projects
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Github className="w-4 h-4" />
                        Import
                    </button>
                    <button
                        onClick={addProject}
                        className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>
            </div>

            {/* GitHub Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md mx-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Github className="w-5 h-5" />
                                Import from GitHub
                            </h3>
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportError(null);
                                }}
                                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-slate-400">
                                Enter a GitHub username to import their top repositories as
                                projects.
                            </p>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    GitHub Username
                                </label>
                                <input
                                    type="text"
                                    value={importUsername}
                                    onChange={(e) => setImportUsername(e.target.value)}
                                    placeholder="octocat"
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    onKeyDown={(e) => e.key === "Enter" && handleGitHubImport()}
                                />
                            </div>
                            {importError && (
                                <p className="text-sm text-red-400">{importError}</p>
                            )}
                        </div>
                        <div className="flex gap-3 p-4 border-t border-slate-700">
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportError(null);
                                }}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGitHubImport}
                                disabled={isImporting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 text-white font-medium rounded-lg transition-colors"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    "Import Projects"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {data.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-lg">
                    <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No projects added yet</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <button
                            onClick={addProject}
                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                        >
                            Add manually
                        </button>
                        <span className="text-slate-600">or</span>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                        >
                            Import from GitHub
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((project, index) => (
                        <div
                            key={index}
                            className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg space-y-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-400">
                                    Project #{index + 1}
                                </span>
                                <button
                                    onClick={() => removeProject(index)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Title & Link */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">
                                        Project Title
                                    </label>
                                    <input
                                        type="text"
                                        value={project.title}
                                        onChange={(e) =>
                                            updateProject(index, "title", e.target.value)
                                        }
                                        placeholder="My Awesome App"
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">
                                        Project Link
                                    </label>
                                    <input
                                        type="url"
                                        value={project.link}
                                        onChange={(e) =>
                                            updateProject(index, "link", e.target.value)
                                        }
                                        placeholder="https://github.com/user/project"
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Tech Stack */}
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-400">
                                    Tech Stack{" "}
                                    <span className="text-slate-500">(comma separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={project.techStack.join(", ")}
                                    onChange={(e) => handleTechStackChange(index, e.target.value)}
                                    placeholder="React, TypeScript, Node.js"
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-400">
                                    Description
                                </label>
                                <SmartTextarea
                                    value={project.description}
                                    onChange={(value) =>
                                        updateProject(index, "description", value)
                                    }
                                    placeholder="• Describe what the project does..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

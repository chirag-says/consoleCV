"use client";

// ConsoleCV - Terminal Theme (Developer Focused)
// Mimics a code editor / terminal interface
// Ideal for backend developers, systems engineers, and CLI lovers

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Terminal,
    Github,
    Linkedin,
    Mail,
    ExternalLink,
    ChevronRight,
    Minus,
    Square,
    X,
    Folder,
    FileCode,
    GitCommit,
    Cpu,
} from "lucide-react";
import type { ResumeData } from "@/types/resume";

// =============================================================================
// COMPONENTS
// =============================================================================

function CommandLine({ children, prompt = true }: { children: React.ReactNode; prompt?: boolean }) {
    return (
        <div className="flex items-start gap-3 font-mono text-sm sm:text-base">
            {prompt && (
                <span className="text-emerald-500 shrink-0 select-none">
                    ➜ <span className="text-blue-400">~</span>
                </span>
            )}
            <div className="text-slate-300 break-words w-full">{children}</div>
        </div>
    );
}

function Comment({ children }: { children: React.ReactNode }) {
    return <span className="text-slate-500 italic select-none">// {children}</span>;
}

function Keyword({ children }: { children: React.ReactNode }) {
    return <span className="text-purple-400">{children}</span>;
}

function StringVal({ children }: { children: React.ReactNode }) {
    return <span className="text-emerald-400">"{children}"</span>;
}

function FunctionName({ children }: { children: React.ReactNode }) {
    return <span className="text-blue-400">{children}</span>;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface TerminalThemeProps {
    data: ResumeData;
}

export default function TerminalTheme({ data }: TerminalThemeProps) {
    const { personal, education, experience, projects, skills } = data;
    const [currentTime, setCurrentTime] = useState("");

    // Simulate typing effect for the header
    const [typedName, setTypedName] = useState("");
    const fullName = personal.fullName;

    useEffect(() => {
        const now = new Date();
        setCurrentTime(
            now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        );

        // Typing animation
        let i = 0;
        const interval = setInterval(() => {
            if (i <= fullName.length) {
                setTypedName(fullName.slice(0, i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [fullName]);

    return (
        <div className="min-h-screen bg-black text-slate-300 font-mono selection:bg-emerald-900/50 selection:text-emerald-200 p-2 sm:p-6">
            <div className="max-w-5xl mx-auto border border-zinc-800 bg-zinc-950 rounded-lg shadow-2xl overflow-hidden">
                {/* Terminal Header (Window Title Bar) */}
                <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-2 group">
                            <div className="w-3 h-3 rounded-full bg-red-500/80 group-hover:bg-red-500 transition-colors" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80 group-hover:bg-yellow-500 transition-colors" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors" />
                        </div>
                        <div className="ml-4 flex items-center gap-2 text-xs text-slate-500">
                            <Folder className="w-3.5 h-3.5" />
                            <span>user</span>
                            <span className="text-slate-700">/</span>
                            <span>portfolio</span>
                            <span className="text-slate-700">/</span>
                            <span className="text-slate-300">README.md</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono hidden sm:block">
                        bash — 80x24
                    </div>
                </div>

                {/* Terminal Content */}
                <div className="p-4 sm:p-8 space-y-12 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">

                    {/* Header: console.log() */}
                    <div className="space-y-2">
                        <CommandLine>
                            <Keyword>const</Keyword> <span className="text-yellow-200">developer</span> = {"{"}
                        </CommandLine>
                        <div className="pl-8 space-y-1">
                            <div>
                                <span className="text-blue-300">name</span>: <StringVal>{typedName}</StringVal><span className="animate-pulse">_</span>,
                            </div>
                            <div>
                                <span className="text-blue-300">role</span>: <StringVal>{data.title || "Full Stack Developer"}</StringVal>,
                            </div>
                            <div>
                                <span className="text-blue-300">status</span>: <StringVal>open_to_work</StringVal>,
                            </div>
                        </div>
                        <CommandLine prompt={false}>{"};"}</CommandLine>

                        <div className="mt-4 pl-4 border-l-2 border-emerald-900/50">
                            <Comment>{personal.summary || "Loading developer profile..."}</Comment>
                        </div>

                        {/* Social Links as imports */}
                        <div className="pt-4 flex flex-wrap gap-4 text-sm">
                            {personal.github && (
                                <a href={`https://github.com/${personal.github.replace(/^github\.com\//, "")}`} target="_blank" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                                    <Github className="w-4 h-4" />
                                    <span>import GitHub</span>
                                </a>
                            )}
                            {personal.linkedin && (
                                <a href={personal.linkedin} target="_blank" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                                    <Linkedin className="w-4 h-4" />
                                    <span>import LinkedIn</span>
                                </a>
                            )}
                            {personal.email && (
                                <a href={`mailto:${personal.email}`} className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span>import Email</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Skills as arrays */}
                    <div className="space-y-4">
                        <CommandLine>
                            <span className="text-purple-400">ls</span> <span className="text-slate-400">-la</span> ./skills
                        </CommandLine>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                            {skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-emerald-300/80 hover:text-emerald-300 transition-colors cursor-default">
                                    <Cpu className="w-3 h-3" />
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Experience Section */}
                    <div className="space-y-6">
                        <CommandLine>
                            <Keyword>function</Keyword> <FunctionName>getExperience</FunctionName>() {"{"}
                        </CommandLine>

                        <div className="pl-4 sm:pl-8 space-y-8 border-l border-zinc-800 ml-2">
                            {experience.map((exp, index) => (
                                <div key={index} className="group relative">
                                    <div className="absolute -left-[37px] top-0 w-3 h-3 bg-zinc-800 rounded-full border-2 border-black group-hover:bg-emerald-500 transition-colors" />

                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                                        <h3 className="text-yellow-200 font-bold">
                                            {exp.role}
                                        </h3>
                                        <span className="text-zinc-500 text-sm">@ {exp.company}</span>
                                    </div>
                                    <div className="text-xs text-zinc-600 font-mono mb-2">
                                        [{exp.start}] -{">"} [{exp.end}]
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-2xl border-l-2 border-zinc-800 pl-4 py-1 hover:border-emerald-500/30 transition-colors">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <CommandLine prompt={false}>{"}"}</CommandLine>
                    </div>

                    {/* Projects Section - JSON object style */}
                    <div className="space-y-6">
                        <CommandLine>
                            <span className="text-purple-400">cat</span> ./projects.json
                        </CommandLine>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map((project, index) => (
                                <div
                                    key={index}
                                    className="border border-zinc-800 bg-zinc-900/30 p-4 rounded hover:border-emerald-500/30 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-blue-300 font-bold">
                                            <FileCode className="w-4 h-4" />
                                            {project.title}
                                        </div>
                                        {project.link && (
                                            <a href={project.link} target="_blank" className="text-zinc-600 hover:text-emerald-400">
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="text-xs text-zinc-500 mb-3 font-mono">
                                        <GitCommit className="w-3 h-3 inline mr-1" />
                                        Initial commit
                                    </div>
                                    <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                                        {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.techStack.map((tech, i) => (
                                            <span key={i} className="text-xs bg-zinc-900 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer CLI */}
                    <div className="pt-12 pb-4 opacity-50">
                        <CommandLine>
                            <span className="animate-pulse">Loading footer... Done.</span>
                        </CommandLine>
                        <div className="mt-2 text-xs text-zinc-600">
                            Process finished with exit code 0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

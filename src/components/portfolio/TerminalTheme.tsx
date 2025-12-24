"use client";

// ConsoleCV - Terminal Theme (Developer Focused)
// Mimics a code editor / terminal interface
// Ideal for backend developers, systems engineers, and CLI lovers
// Mobile-optimized with responsive font sizes and word wrapping

import React, { useState, useEffect } from "react";
import {
    Github,
    Linkedin,
    Mail,
    ExternalLink,
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
        <div className="flex items-start gap-2 md:gap-3 font-mono text-xs sm:text-sm md:text-base">
            {prompt && (
                <span className="text-emerald-500 shrink-0 select-none">
                    ➜ <span className="text-blue-400">~</span>
                </span>
            )}
            <div className="text-slate-300 break-words overflow-wrap-anywhere w-full min-w-0">{children}</div>
        </div>
    );
}

function Comment({ children }: { children: React.ReactNode }) {
    return <span className="text-slate-500 italic select-none break-words overflow-wrap-anywhere">{"//"} {children}</span>;
}

function Keyword({ children }: { children: React.ReactNode }) {
    return <span className="text-purple-400">{children}</span>;
}

function StringVal({ children }: { children: React.ReactNode }) {
    return <span className="text-emerald-400 break-words">&quot;{children}&quot;</span>;
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
    const { personal, experience, projects, skills } = data;

    // Simulate typing effect for the header
    const [typedName, setTypedName] = useState("");
    const fullName = personal.fullName;

    useEffect(() => {
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
        <div className="min-h-screen bg-black text-slate-300 font-mono selection:bg-emerald-900/50 selection:text-emerald-200 p-1 sm:p-2 md:p-6">
            <div className="max-w-5xl mx-auto border border-zinc-800 bg-zinc-950 rounded-lg shadow-2xl overflow-hidden">
                {/* Terminal Header (Window Title Bar) */}
                <div className="bg-zinc-900 border-b border-zinc-800 px-2 sm:px-4 py-2 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 md:gap-2 group">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80 group-hover:bg-red-500 transition-colors" />
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80 group-hover:bg-yellow-500 transition-colors" />
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors" />
                        </div>
                        <div className="ml-2 md:ml-4 flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-slate-500">
                            <Folder className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            <span className="hidden sm:inline">user</span>
                            <span className="text-slate-700 hidden sm:inline">/</span>
                            <span className="hidden sm:inline">portfolio</span>
                            <span className="text-slate-700 hidden sm:inline">/</span>
                            <span className="text-slate-300">README.md</span>
                        </div>
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-500 font-mono hidden sm:block">
                        bash — 80x24
                    </div>
                </div>

                {/* Terminal Content */}
                <div className="p-3 sm:p-4 md:p-8 space-y-8 md:space-y-12 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-100px)] custom-scrollbar">

                    {/* Header: console.log() */}
                    <div className="space-y-2">
                        <CommandLine>
                            <Keyword>const</Keyword> <span className="text-yellow-200">developer</span> = {"{"}
                        </CommandLine>
                        <div className="pl-4 sm:pl-6 md:pl-8 space-y-1">
                            <div className="break-words overflow-wrap-anywhere">
                                <span className="text-blue-300">name</span>: <StringVal>{typedName}</StringVal><span className="animate-pulse">_</span>,
                            </div>
                            <div className="break-words overflow-wrap-anywhere">
                                <span className="text-blue-300">role</span>: <StringVal>{data.title || "Full Stack Developer"}</StringVal>,
                            </div>
                            <div>
                                <span className="text-blue-300">status</span>: <StringVal>open_to_work</StringVal>,
                            </div>
                        </div>
                        <CommandLine prompt={false}>{"};"};</CommandLine>

                        <div className="mt-3 md:mt-4 pl-3 md:pl-4 border-l-2 border-emerald-900/50">
                            <Comment>{personal.summary || "Loading developer profile..."}</Comment>
                        </div>

                        {/* Social Links as imports */}
                        <div className="pt-3 md:pt-4 flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
                            {personal.github && (
                                <a href={`https://github.com/${personal.github.replace(/^github\.com\//, "")}`} target="_blank" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 md:gap-2">
                                    <Github className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span>import GitHub</span>
                                </a>
                            )}
                            {personal.linkedin && (
                                <a href={personal.linkedin} target="_blank" className="hover:text-blue-400 transition-colors flex items-center gap-1.5 md:gap-2">
                                    <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span>import LinkedIn</span>
                                </a>
                            )}
                            {personal.email && (
                                <a href={`mailto:${personal.email}`} className="hover:text-yellow-400 transition-colors flex items-center gap-1.5 md:gap-2">
                                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span>import Email</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Skills as arrays */}
                    <div className="space-y-3 md:space-y-4">
                        <CommandLine>
                            <span className="text-purple-400">ls</span> <span className="text-slate-400">-la</span> ./skills
                        </CommandLine>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 pt-2">
                            {skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-emerald-300/80 hover:text-emerald-300 transition-colors cursor-default break-words overflow-wrap-anywhere">
                                    <Cpu className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                                    <span className="truncate">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Experience Section */}
                    <div className="space-y-4 md:space-y-6">
                        <CommandLine>
                            <Keyword>function</Keyword> <FunctionName>getExperience</FunctionName>() {"{"}
                        </CommandLine>

                        <div className="pl-3 sm:pl-4 md:pl-8 space-y-6 md:space-y-8 border-l border-zinc-800 ml-1 md:ml-2">
                            {experience.map((exp, index) => (
                                <div key={index} className="group relative">
                                    <div className="absolute -left-[17px] sm:-left-[21px] md:-left-[37px] top-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-zinc-800 rounded-full border-2 border-black group-hover:bg-emerald-500 transition-colors" />

                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 md:gap-2 mb-1">
                                        <h3 className="text-yellow-200 font-bold text-sm md:text-base break-words">
                                            {exp.role}
                                        </h3>
                                        <span className="text-zinc-500 text-xs md:text-sm">@ {exp.company}</span>
                                    </div>
                                    <div className="text-[10px] md:text-xs text-zinc-600 font-mono mb-2">
                                        [{exp.start}] -{">"} [{exp.end}]
                                    </div>
                                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-2xl border-l-2 border-zinc-800 pl-2 md:pl-4 py-1 hover:border-emerald-500/30 transition-colors break-words overflow-wrap-anywhere whitespace-pre-wrap">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <CommandLine prompt={false}>{"}"}</CommandLine>
                    </div>

                    {/* Projects Section - JSON object style */}
                    <div className="space-y-4 md:space-y-6">
                        <CommandLine>
                            <span className="text-purple-400">cat</span> ./projects.json
                        </CommandLine>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {projects.map((project, index) => (
                                <div
                                    key={index}
                                    className="border border-zinc-800 bg-zinc-900/30 p-3 md:p-4 rounded hover:border-emerald-500/30 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-2 gap-2">
                                        <div className="flex items-center gap-1.5 md:gap-2 text-blue-300 font-bold text-sm md:text-base min-w-0">
                                            <FileCode className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                            <span className="truncate">{project.title}</span>
                                        </div>
                                        {project.link && (
                                            <a href={project.link} target="_blank" className="text-zinc-600 hover:text-emerald-400 shrink-0">
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="text-[10px] md:text-xs text-zinc-500 mb-2 md:mb-3 font-mono">
                                        <GitCommit className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-1" />
                                        Initial commit
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-400 mb-3 md:mb-4 line-clamp-3 break-words overflow-wrap-anywhere">
                                        {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                                        {project.techStack.map((tech, i) => (
                                            <span key={i} className="text-[10px] md:text-xs bg-zinc-900 border border-zinc-700 text-zinc-400 px-1.5 md:px-2 py-0.5 rounded">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer CLI */}
                    <div className="pt-8 md:pt-12 pb-2 md:pb-4 opacity-50">
                        <CommandLine>
                            <span className="animate-pulse">Loading footer... Done.</span>
                        </CommandLine>
                        <div className="mt-2 text-[10px] md:text-xs text-zinc-600">
                            Process finished with exit code 0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

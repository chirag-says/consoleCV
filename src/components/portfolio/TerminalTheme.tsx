"use client";

// ConsoleCV - Terminal Theme (Developer Focused)
// Mimics a code editor / terminal interface
// Ideal for backend developers, systems engineers, and CLI lovers
// Mobile-optimized with responsive font sizes and word wrapping
// Enhanced with neon glow effects and futuristic console atmosphere

import React from "react";
import { motion } from "framer-motion";
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
import ScrambleText from "@/components/ui/ScrambleText";
import NetworkBackground from "@/components/portfolio/NetworkBackground";

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


    return (
        <div className="min-h-screen bg-black text-slate-300 font-mono selection:bg-emerald-900/50 selection:text-emerald-200 relative overflow-hidden">
            {/* Neural Network Background */}
            <NetworkBackground
                nodeCount={60}
                connectionDistance={120}
                mouseInfluenceDistance={180}
                color="16, 185, 129"
            />

            {/* Custom cursor glow effect */}
            <style jsx global>{`
                .terminal-theme {
                    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect x='10' y='4' width='4' height='16' fill='%2310b981' opacity='0.8'/%3E%3C/svg%3E") 12 12, auto;
                }
                
                .neon-glow {
                    text-shadow: 0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3), 0 0 30px rgba(16, 185, 129, 0.2);
                }
                
                .neon-border {
                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3), inset 0 0 10px rgba(16, 185, 129, 0.05);
                }
                
                .neon-border-hover:hover {
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 15px rgba(16, 185, 129, 0.1);
                }
                
                @keyframes borderPulse {
                    0%, 100% { border-color: rgba(16, 185, 129, 0.3); }
                    50% { border-color: rgba(16, 185, 129, 0.8); }
                }
                
                .pulse-border {
                    animation: borderPulse 2s ease-in-out infinite;
                }
            `}</style>

            <div className="p-1 sm:p-2 md:p-6 relative z-10 terminal-theme">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto border border-emerald-900/50 bg-zinc-950/95 rounded-lg shadow-2xl overflow-hidden neon-border backdrop-blur-sm"
                >
                    {/* Terminal Header (Window Title Bar) */}
                    <div className="bg-zinc-900/90 border-b border-emerald-900/30 px-2 sm:px-4 py-2 flex items-center justify-between sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5 md:gap-2 group">
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80 group-hover:bg-red-500 transition-colors shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80 group-hover:bg-yellow-500 transition-colors shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                            <div className="ml-2 md:ml-4 flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-slate-500">
                                <Folder className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                <span className="hidden sm:inline">user</span>
                                <span className="text-slate-700 hidden sm:inline">/</span>
                                <span className="hidden sm:inline">portfolio</span>
                                <span className="text-slate-700 hidden sm:inline">/</span>
                                <span className="text-emerald-400 neon-glow">README.md</span>
                            </div>
                        </div>
                        <div className="text-[10px] md:text-xs text-emerald-500/70 font-mono hidden sm:block">
                            <span className="animate-pulse">●</span> LIVE — 80x24
                        </div>
                    </div>

                    {/* Terminal Content */}
                    <div className="p-3 sm:p-4 md:p-8 space-y-8 md:space-y-12 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-100px)] custom-scrollbar">

                        {/* Header: console.log() */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-2"
                        >
                            <CommandLine>
                                <Keyword>const</Keyword> <span className="text-yellow-200">developer</span> = {"{"}
                            </CommandLine>
                            <div className="pl-4 sm:pl-6 md:pl-8 space-y-1">
                                <div className="break-words overflow-wrap-anywhere">
                                    <span className="text-blue-300">name</span>: <span className="text-emerald-400 neon-glow">&quot;<ScrambleText text={personal.fullName} speed={40} className="inline" />&quot;</span><span className="animate-pulse text-emerald-400">█</span>,
                                </div>
                                <div className="break-words overflow-wrap-anywhere">
                                    <span className="text-blue-300">role</span>: <StringVal><ScrambleText text={data.title || "Full Stack Developer"} speed={35} delay={200} className="inline" /></StringVal>,
                                </div>
                                <div>
                                    <span className="text-blue-300">status</span>: <StringVal>open_to_work</StringVal>,
                                </div>
                            </div>
                            <CommandLine prompt={false}>{"};"};</CommandLine>

                            <div className="mt-3 md:mt-4 pl-3 md:pl-4 border-l-2 border-emerald-500/30 hover:border-emerald-500/60 transition-colors">
                                <Comment>{personal.summary || "Loading developer profile..."}</Comment>
                            </div>

                            {/* Social Links as imports */}
                            <div className="pt-3 md:pt-4 flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
                                {personal.github && (
                                    <motion.a
                                        whileHover={{ scale: 1.05, x: 3 }}
                                        href={`https://github.com/${personal.github.replace(/^github\.com\//, "")}`}
                                        target="_blank"
                                        className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 md:gap-2 group"
                                    >
                                        <Github className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        <span>import GitHub</span>
                                    </motion.a>
                                )}
                                {personal.linkedin && (
                                    <motion.a
                                        whileHover={{ scale: 1.05, x: 3 }}
                                        href={personal.linkedin}
                                        target="_blank"
                                        className="hover:text-blue-400 transition-colors flex items-center gap-1.5 md:gap-2 group"
                                    >
                                        <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                        <span>import LinkedIn</span>
                                    </motion.a>
                                )}
                                {personal.email && (
                                    <motion.a
                                        whileHover={{ scale: 1.05, x: 3 }}
                                        href={`mailto:${personal.email}`}
                                        className="hover:text-yellow-400 transition-colors flex items-center gap-1.5 md:gap-2 group"
                                    >
                                        <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                                        <span>import Email</span>
                                    </motion.a>
                                )}
                            </div>
                        </motion.div>

                        {/* Skills as arrays */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-3 md:space-y-4"
                        >
                            <CommandLine>
                                <span className="text-purple-400 neon-glow">ls</span> <span className="text-slate-400">-la</span> ./skills
                            </CommandLine>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 pt-2">
                                {skills.map((skill, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.03 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-emerald-300/80 hover:text-emerald-300 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-all cursor-default break-words overflow-wrap-anywhere"
                                    >
                                        <Cpu className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                                        <span className="truncate">{skill}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Experience Section */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-4 md:space-y-6"
                        >
                            <CommandLine>
                                <Keyword>function</Keyword> <FunctionName>getExperience</FunctionName>() {"{"}
                            </CommandLine>

                            <div className="pl-3 sm:pl-4 md:pl-8 space-y-6 md:space-y-8 border-l border-emerald-900/30 ml-1 md:ml-2">
                                {experience.map((exp, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                        className="group relative"
                                    >
                                        <div className="absolute -left-[17px] sm:-left-[21px] md:-left-[37px] top-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-zinc-800 rounded-full border-2 border-black group-hover:bg-emerald-500 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-all duration-300" />

                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 md:gap-2 mb-1">
                                            <h3 className="text-yellow-200 font-bold text-sm md:text-base break-words group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] transition-all">
                                                {exp.role}
                                            </h3>
                                            <span className="text-zinc-500 text-xs md:text-sm">@ {exp.company}</span>
                                        </div>
                                        <div className="text-[10px] md:text-xs text-emerald-600/70 font-mono mb-2">
                                            [{exp.start}] -{">"} [{exp.end}]
                                        </div>
                                        <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-2xl border-l-2 border-zinc-800 pl-2 md:pl-4 py-1 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all break-words overflow-wrap-anywhere whitespace-pre-wrap rounded-r">
                                            {exp.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                            <CommandLine prompt={false}>{"}"}</CommandLine>
                        </motion.div>

                        {/* Projects Section - JSON object style */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="space-y-4 md:space-y-6"
                        >
                            <CommandLine>
                                <span className="text-purple-400 neon-glow">cat</span> ./projects.json
                            </CommandLine>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {projects.map((project, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 + index * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="border border-emerald-900/30 bg-zinc-900/50 p-3 md:p-4 rounded-lg 
                                                   hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] 
                                                   transition-all duration-300 group backdrop-blur-sm neon-border-hover"
                                    >
                                        <div className="flex items-center justify-between mb-2 gap-2">
                                            <div className="flex items-center gap-1.5 md:gap-2 text-blue-300 font-bold text-sm md:text-base min-w-0 group-hover:text-blue-200 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all">
                                                <FileCode className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                                <span className="truncate">{project.title}</span>
                                            </div>
                                            {project.link && (
                                                <motion.a
                                                    whileHover={{ scale: 1.2, rotate: 15 }}
                                                    href={project.link}
                                                    target="_blank"
                                                    className="text-zinc-600 hover:text-emerald-400 shrink-0 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </motion.a>
                                            )}
                                        </div>
                                        <div className="text-[10px] md:text-xs text-emerald-600/50 mb-2 md:mb-3 font-mono">
                                            <GitCommit className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-1" />
                                            Initial commit
                                        </div>
                                        <p className="text-xs md:text-sm text-slate-400 mb-3 md:mb-4 line-clamp-3 break-words overflow-wrap-anywhere">
                                            {project.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                                            {project.techStack.map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="text-[10px] md:text-xs bg-emerald-950/50 border border-emerald-900/30 text-emerald-400/70 px-1.5 md:px-2 py-0.5 rounded hover:border-emerald-500/50 hover:text-emerald-300 transition-all"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Footer CLI */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: 1.2 }}
                            className="pt-8 md:pt-12 pb-2 md:pb-4"
                        >
                            <CommandLine>
                                <span className="text-emerald-400">✓</span> <span className="text-slate-400">Process completed successfully</span>
                            </CommandLine>
                            <div className="mt-2 text-[10px] md:text-xs text-emerald-600/50 font-mono">
                                exit code 0 • {new Date().toLocaleTimeString()}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

"use client";

// ConsoleCV - Cyber Theme (Dark Tech)
// Professional dark theme with deep slate gradients and subtle interactions
// Designed for a premium, modern developer portfolio look
// Mobile-optimized with responsive grids and typography

import React from "react";
import { motion } from "framer-motion";
import {
    Github,
    Linkedin,
    Mail,
    Phone,
    ExternalLink,
    Code2,
    Briefcase,
    GraduationCap,
    MapPin,
    Calendar,
} from "lucide-react";
import type { ResumeData } from "@/types/resume";

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// =============================================================================
// COMPONENTS
// =============================================================================

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
    return (
        <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="p-2 md:p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50 text-indigo-400">
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">{title}</h2>
        </div>
    );
}

function TechBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-2 py-1 md:px-3 bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 text-slate-300 text-xs font-medium rounded-full transition-colors">
            {children}
        </span>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface CyberThemeProps {
    data: ResumeData;
}

export default function CyberTheme({ data }: CyberThemeProps) {
    const { personal, education, experience, projects, skills } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-925 to-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Background Texture */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-12 md:space-y-20"
                >
                    {/* Header Section */}
                    <motion.header variants={itemVariants} className="text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-center sm:items-start justify-between">
                            <div className="space-y-3 md:space-y-4 max-w-2xl">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-2">
                                        {personal.fullName}
                                    </h1>
                                    <p className="text-lg sm:text-xl md:text-2xl text-indigo-400 font-medium">
                                        {data.title || "Software Engineer"}
                                    </p>
                                </div>

                                {personal.summary && (
                                    <p className="text-slate-400 leading-relaxed text-base md:text-lg max-w-xl break-words">
                                        {personal.summary}
                                    </p>
                                )}

                                {/* Contact Links */}
                                <div className="flex flex-wrap gap-2 md:gap-3 justify-center sm:justify-start pt-3 md:pt-4">
                                    {personal.github && (
                                        <a
                                            href={`https://github.com/${personal.github.replace(/^github\.com\//, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/50 hover:border-indigo-500/30 text-sm md:text-base"
                                        >
                                            <Github className="w-4 h-4" />
                                            <span>GitHub</span>
                                        </a>
                                    )}
                                    {personal.linkedin && (
                                        <a
                                            href={personal.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/50 hover:border-indigo-500/30 text-sm md:text-base"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                            <span>LinkedIn</span>
                                        </a>
                                    )}
                                    {personal.email && (
                                        <a
                                            href={`mailto:${personal.email}`}
                                            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/50 hover:border-indigo-500/30 text-sm md:text-base"
                                        >
                                            <Mail className="w-4 h-4" />
                                            <span>Email</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Optional: Avatar or Abstract Shape */}
                            <div className="hidden sm:block shrink-0">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 p-1 shadow-2xl shadow-indigo-500/20 rotate-3 transition-transform hover:rotate-0">
                                    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                                        <div className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                                            {personal.fullName.slice(0, 2).toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                        {/* Main Content Column */}
                        <div className="lg:col-span-8 space-y-12 md:space-y-16">

                            {/* Experience Section */}
                            {experience.length > 0 && (
                                <motion.section variants={itemVariants}>
                                    <SectionHeader icon={Briefcase} title="Experience" />
                                    <div className="space-y-6 md:space-y-8 border-l-2 border-slate-800/50 ml-2 md:ml-3 pl-4 md:pl-8 relative">
                                        {experience.map((exp, index) => (
                                            <div key={index} className="relative">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[25px] md:-left-[41px] top-1.5 w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-slate-900 bg-slate-700" />

                                                <div className="group">
                                                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                                                        <h3 className="text-lg md:text-xl font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                                                            {exp.role}
                                                        </h3>
                                                        <span className="text-xs md:text-sm font-mono text-slate-500 whitespace-nowrap">
                                                            {exp.start} — {exp.end}
                                                        </span>
                                                    </div>
                                                    <div className="text-base md:text-lg text-slate-400 mb-2 md:mb-3 font-medium">
                                                        {exp.company}
                                                    </div>
                                                    <p className="text-slate-400 leading-relaxed whitespace-pre-wrap text-sm md:text-base break-words overflow-wrap-anywhere">
                                                        {exp.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Projects Section */}
                            {projects.length > 0 && (
                                <motion.section variants={itemVariants}>
                                    <SectionHeader icon={Code2} title="Featured Projects" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        {projects.map((project, index) => (
                                            <div
                                                key={index}
                                                className="group p-4 md:p-6 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/30 rounded-xl transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start mb-3 md:mb-4">
                                                    <h3 className="text-lg md:text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors break-words pr-2">
                                                        {project.title}
                                                    </h3>
                                                    {project.link && (
                                                        <a
                                                            href={project.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
                                                        >
                                                            <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                                                        </a>
                                                    )}
                                                </div>
                                                <p className="text-slate-400 mb-4 md:mb-6 leading-relaxed text-sm md:text-base break-words overflow-wrap-anywhere">
                                                    {project.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                    {project.techStack.map((tech, i) => (
                                                        <TechBadge key={i}>{tech}</TechBadge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}
                        </div>

                        {/* Sidebar Column */}
                        <div className="lg:col-span-4 space-y-8 md:space-y-12">

                            {/* Skills Section */}
                            {skills.length > 0 && (
                                <motion.section variants={itemVariants}>
                                    <SectionHeader icon={Code2} title="Skills" />
                                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                                        {skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-2.5 py-1 md:px-3 md:py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs md:text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Education Section */}
                            {education.length > 0 && (
                                <motion.section variants={itemVariants}>
                                    <SectionHeader icon={GraduationCap} title="Education" />
                                    <div className="space-y-4 md:space-y-6">
                                        {education.map((edu, index) => (
                                            <div key={index} className="space-y-1">
                                                <h3 className="font-semibold text-slate-100 text-sm md:text-base break-words">
                                                    {edu.school}
                                                </h3>
                                                <div className="text-indigo-400 text-xs md:text-sm break-words">
                                                    {edu.degree}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-mono mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {edu.start} — {edu.end}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Contact Info (Details) */}
                            <motion.section variants={itemVariants} className="pt-6 md:pt-8 border-t border-slate-800/50">
                                <h3 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 md:mb-4">
                                    Contact Details
                                </h3>
                                <div className="space-y-2 md:space-y-3">
                                    {personal.email && (
                                        <div className="flex items-center gap-3 text-slate-400 text-xs md:text-sm break-all">
                                            <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                                            {personal.email}
                                        </div>
                                    )}
                                    {personal.phone && (
                                        <div className="flex items-center gap-3 text-slate-400 text-xs md:text-sm">
                                            <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                                            {personal.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-slate-400 text-xs md:text-sm">
                                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                                        Remote / Relocate
                                    </div>
                                </div>
                            </motion.section>
                        </div>
                    </div>

                    {/* Footer */}
                    <motion.footer
                        variants={itemVariants}
                        className="pt-12 md:pt-20 pb-6 md:pb-8 text-center text-slate-600 text-xs md:text-sm"
                    >
                        <p>Built with <a href="https://consolecv.com" className="hover:text-indigo-400 transition-colors">ConsoleCV</a></p>
                    </motion.footer>
                </motion.div>
            </div>
        </div>
    );
}

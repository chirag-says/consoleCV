"use client";

// ConsoleCV - Minimal Theme
// Clean, elegant, print-friendly design
// Focuses on typography, whitespace, and readability
// Mobile-optimized with responsive layout and stacking

import React from "react";
import {
    Github,
    Linkedin,
    Mail,
    MapPin,
    ExternalLink,
} from "lucide-react";
import type { ResumeData } from "@/types/resume";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface MinimalThemeProps {
    data: ResumeData;
}

export default function MinimalTheme({ data }: MinimalThemeProps) {
    const { personal, education, experience, projects, skills } = data;

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
            <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-sm sm:my-4 md:my-8 px-4 py-8 sm:px-8 sm:py-12 md:p-16">

                {/* Header */}
                <header className="border-b-2 border-gray-900 pb-6 md:pb-8 mb-8 md:mb-12">
                    <div className="flex flex-col gap-6">
                        {/* Name and Title */}
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-2 break-words">
                                {personal.fullName}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 font-medium tracking-wide">
                                {data.title || "Software Engineer"}
                            </p>
                            {personal.summary && (
                                <p className="mt-3 md:mt-4 text-gray-600 max-w-xl leading-relaxed text-sm md:text-base break-words mx-auto sm:mx-0">
                                    {personal.summary}
                                </p>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs md:text-sm text-gray-600 items-center sm:items-start justify-center sm:justify-start">
                            {personal.email && (
                                <a href={`mailto:${personal.email}`} className="hover:text-black transition-colors flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span className="break-all">{personal.email}</span>
                                </a>
                            )}
                            {personal.github && (
                                <a href={`https://github.com/${personal.github.replace(/^github\.com\//, "")}`} target="_blank" className="hover:text-black transition-colors flex items-center gap-2">
                                    <Github className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span>github.com/{personal.github.replace(/^github\.com\//, "")}</span>
                                </a>
                            )}
                            {personal.linkedin && (
                                <a href={personal.linkedin} target="_blank" className="hover:text-black transition-colors flex items-center gap-2">
                                    <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span>LinkedIn</span>
                                </a>
                            )}
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span>Remote</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Left Column (Main Content) */}
                    <main className="lg:col-span-8 space-y-8 md:space-y-12 order-2 lg:order-1">

                        {/* Experience */}
                        {experience.length > 0 && (
                            <section>
                                <h2 className="text-xs md:text-sm font-bold text-gray-900 mb-4 md:mb-6 uppercase tracking-wider border-b border-gray-200 pb-2">
                                    Experience
                                </h2>
                                <div className="space-y-6 md:space-y-8">
                                    {experience.map((exp, index) => (
                                        <div key={index} className="group">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1">
                                                <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors break-words">
                                                    {exp.company}
                                                </h3>
                                                <span className="text-xs md:text-sm text-gray-500 font-medium whitespace-nowrap">
                                                    {exp.start} — {exp.end}
                                                </span>
                                            </div>
                                            <div className="text-indigo-600 font-medium mb-2 md:mb-3 text-sm md:text-base">
                                                {exp.role}
                                            </div>
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base break-words overflow-wrap-anywhere">
                                                {exp.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Projects */}
                        {projects.length > 0 && (
                            <section>
                                <h2 className="text-xs md:text-sm font-bold text-gray-900 mb-4 md:mb-6 uppercase tracking-wider border-b border-gray-200 pb-2">
                                    Projects
                                </h2>
                                <div className="space-y-4 md:space-y-6">
                                    {projects.map((project, index) => (
                                        <div key={index} className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors break-words">
                                                    {project.title}
                                                </h3>
                                                {project.link && (
                                                    <a href={project.link} target="_blank" className="text-gray-400 hover:text-indigo-600 shrink-0">
                                                        <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-2 leading-relaxed text-sm md:text-base break-words overflow-wrap-anywhere">
                                                {project.description}
                                            </p>
                                            <div className="flex flex-wrap gap-x-3 md:gap-x-4 gap-y-1 text-xs md:text-sm text-gray-500 font-medium">
                                                {project.techStack.map((tech, i) => (
                                                    <span key={i} className="flex items-center gap-1">
                                                        <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-indigo-600/60" />
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    {/* Right Column (Sidebar) - Shows first on mobile */}
                    <aside className="lg:col-span-4 space-y-8 md:space-y-12 order-1 lg:order-2">

                        {/* Skills */}
                        {skills.length > 0 && (
                            <section>
                                <h2 className="text-xs md:text-sm font-bold text-gray-900 mb-3 md:mb-4 uppercase tracking-wider border-b border-gray-200 pb-2">
                                    Skills
                                </h2>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-2.5 py-1 md:px-3 bg-gray-100 text-gray-700 text-xs md:text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education */}
                        {education.length > 0 && (
                            <section>
                                <h2 className="text-xs md:text-sm font-bold text-gray-900 mb-3 md:mb-4 uppercase tracking-wider border-b border-gray-200 pb-2">
                                    Education
                                </h2>
                                <div className="space-y-4 md:space-y-6">
                                    {education.map((edu, index) => (
                                        <div key={index}>
                                            <h3 className="font-bold text-gray-900 text-sm md:text-base break-words">
                                                {edu.school}
                                            </h3>
                                            <div className="text-gray-600 text-xs md:text-sm mb-1 break-words">
                                                {edu.degree}
                                            </div>
                                            <div className="text-gray-500 text-[10px] md:text-xs font-medium">
                                                {edu.start} — {edu.end}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </aside>
                </div>

                <footer className="mt-12 md:mt-20 pt-6 md:pt-8 border-t border-gray-100 text-center text-gray-400 text-xs md:text-sm">
                    &copy; {new Date().getFullYear()} {personal.fullName}
                </footer>
            </div>
        </div>
    );
}

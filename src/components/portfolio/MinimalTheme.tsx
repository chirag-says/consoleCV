"use client";

// ConsoleCV - Minimal Theme
// Clean, elegant, print-friendly design
// Focuses on typography, whitespace, and readability

import React from "react";
import { motion } from "framer-motion";
import {
    Github,
    Linkedin,
    Mail,
    Globe,
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
            <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-sm sm:my-8 px-8 py-12 sm:p-16">

                {/* Header */}
                <header className="border-b-2 border-gray-900 pb-8 mb-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-2">
                                {personal.fullName}
                            </h1>
                            <p className="text-xl text-gray-600 font-medium tracking-wide">
                                {data.title || "Software Engineer"}
                            </p>
                            {personal.summary && (
                                <p className="mt-4 text-gray-600 max-w-xl leading-relaxed">
                                    {personal.summary}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-gray-600 sm:text-right shrink-0">
                            {personal.email && (
                                <a href={`mailto:${personal.email}`} className="hover:text-black transition-colors flex items-center gap-2 sm:flex-row-reverse">
                                    <Mail className="w-4 h-4" />
                                    {personal.email}
                                </a>
                            )}
                            {personal.github && (
                                <a href={`https://github.com/${personal.github.replace(/^github\.com\//, "")}`} target="_blank" className="hover:text-black transition-colors flex items-center gap-2 sm:flex-row-reverse">
                                    <Github className="w-4 h-4" />
                                    github.com/{personal.github.replace(/^github\.com\//, "")}
                                </a>
                            )}
                            {personal.linkedin && (
                                <a href={personal.linkedin} target="_blank" className="hover:text-black transition-colors flex items-center gap-2 sm:flex-row-reverse">
                                    <Linkedin className="w-4 h-4" />
                                    LinkedIn
                                </a>
                            )}
                            <div className="flex items-center gap-2 sm:flex-row-reverse">
                                <MapPin className="w-4 h-4" />
                                Remote
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column (Main Content) */}
                    <main className="lg:col-span-8 space-y-12">

                        {/* Experience */}
                        {experience.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm border-b border-gray-200 pb-2">
                                    Experience
                                </h2>
                                <div className="space-y-8">
                                    {experience.map((exp, index) => (
                                        <div key={index} className="group">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {exp.company}
                                                </h3>
                                                <span className="text-sm text-gray-500 font-medium">
                                                    {exp.start} — {exp.end}
                                                </span>
                                            </div>
                                            <div className="text-indigo-600 font-medium mb-3">
                                                {exp.role}
                                            </div>
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
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
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm border-b border-gray-200 pb-2">
                                    Projects
                                </h2>
                                <div className="space-y-6">
                                    {projects.map((project, index) => (
                                        <div key={index} className="group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {project.title}
                                                </h3>
                                                {project.link && (
                                                    <a href={project.link} target="_blank" className="text-gray-400 hover:text-indigo-600">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-2 leading-relaxed">
                                                {project.description}
                                            </p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                                                {project.techStack.map((tech, i) => (
                                                    <span key={i} className="flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600/60" />
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

                    {/* Right Column (Sidebar) */}
                    <aside className="lg:col-span-4 space-y-12">

                        {/* Skills */}
                        {skills.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm border-b border-gray-200 pb-2">
                                    Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
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
                                <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm border-b border-gray-200 pb-2">
                                    Education
                                </h2>
                                <div className="space-y-6">
                                    {education.map((edu, index) => (
                                        <div key={index}>
                                            <h3 className="font-bold text-gray-900">
                                                {edu.school}
                                            </h3>
                                            <div className="text-gray-600 text-sm mb-1">
                                                {edu.degree}
                                            </div>
                                            <div className="text-gray-500 text-xs font-medium">
                                                {edu.start} — {edu.end}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </aside>
                </div>

                <footer className="mt-20 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} {personal.fullName}
                </footer>
            </div>
        </div>
    );
}

"use client";

// InternDeck - Resume Preview Component
// A4-sized real-time preview of the resume data

import React, { forwardRef } from "react";
import {
    Mail,
    Phone,
    Github,
    Linkedin,
    ExternalLink,
    GraduationCap,
    Briefcase,
    FolderGit2,
    Zap,
} from "lucide-react";
import type { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
    data: ResumeData;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
    ({ data }, ref) => {
        const { personal, education, experience, projects, skills } = data;

        // Check if there's any content to display
        const hasPersonalInfo =
            personal.fullName ||
            personal.email ||
            personal.phone ||
            personal.github ||
            personal.linkedin;
        const hasEducation = education.length > 0;
        const hasExperience = experience.length > 0;
        const hasProjects = projects.length > 0;
        const hasSkills = skills.length > 0;
        const isEmpty =
            !hasPersonalInfo &&
            !hasEducation &&
            !hasExperience &&
            !hasProjects &&
            !hasSkills;

        return (
            <div
                ref={ref}
                className="w-[210mm] min-h-[297mm] bg-white shadow-2xl mx-auto"
                style={{
                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                }}
            >
                {/* Resume Content */}
                <div className="p-8 text-gray-800">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-[260mm] text-gray-400">
                            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <FolderGit2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-500">
                                Your Resume Preview
                            </h3>
                            <p className="text-sm mt-2 text-center max-w-xs">
                                Start filling out the form on the left to see your resume come
                                to life here.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Header - Personal Info */}
                            {hasPersonalInfo && (
                                <header className="mb-6 pb-4 border-b-2 border-cyan-500">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {personal.fullName || "Your Name"}
                                    </h1>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        {personal.email && (
                                            <a
                                                href={`mailto:${personal.email}`}
                                                className="flex items-center gap-1.5 hover:text-cyan-600"
                                            >
                                                <Mail className="w-4 h-4" />
                                                {personal.email}
                                            </a>
                                        )}
                                        {personal.phone && (
                                            <span className="flex items-center gap-1.5">
                                                <Phone className="w-4 h-4" />
                                                {personal.phone}
                                            </span>
                                        )}
                                        {personal.github && (
                                            <a
                                                href={`https://github.com/${personal.github}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 hover:text-cyan-600"
                                            >
                                                <Github className="w-4 h-4" />
                                                {personal.github}
                                            </a>
                                        )}
                                        {personal.linkedin && (
                                            <a
                                                href={personal.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 hover:text-cyan-600"
                                            >
                                                <Linkedin className="w-4 h-4" />
                                                LinkedIn
                                            </a>
                                        )}
                                    </div>
                                </header>
                            )}

                            {/* Education Section */}
                            {hasEducation && (
                                <section className="mb-5">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-200 pb-1">
                                        <GraduationCap className="w-5 h-5 text-cyan-600" />
                                        Education
                                    </h2>
                                    <div className="space-y-3">
                                        {education.map((edu, index) => (
                                            <div key={index}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            {edu.school}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{edu.degree}</p>
                                                    </div>
                                                    <span className="text-sm text-gray-500 whitespace-nowrap">
                                                        {edu.start} — {edu.end}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Experience Section */}
                            {hasExperience && (
                                <section className="mb-5">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-200 pb-1">
                                        <Briefcase className="w-5 h-5 text-cyan-600" />
                                        Experience
                                    </h2>
                                    <div className="space-y-4">
                                        {experience.map((exp, index) => (
                                            <div key={index}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            {exp.role}
                                                        </h3>
                                                        <p className="text-sm text-cyan-700 font-medium">
                                                            {exp.company}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm text-gray-500 whitespace-nowrap">
                                                        {exp.start} — {exp.end}
                                                    </span>
                                                </div>
                                                {exp.description && (
                                                    <div className="mt-1.5 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                                        {exp.description}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Projects Section */}
                            {hasProjects && (
                                <section className="mb-5">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-200 pb-1">
                                        <FolderGit2 className="w-5 h-5 text-cyan-600" />
                                        Projects
                                    </h2>
                                    <div className="space-y-4">
                                        {projects.map((project, index) => (
                                            <div key={index}>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {project.title}
                                                    </h3>
                                                    {project.link && (
                                                        <a
                                                            href={project.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-cyan-600 hover:text-cyan-700"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                                {project.techStack.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {project.techStack.map((tech, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {project.description && (
                                                    <p className="mt-1.5 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Skills Section */}
                            {hasSkills && (
                                <section>
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-200 pb-1">
                                        <Zap className="w-5 h-5 text-cyan-600" />
                                        Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-cyan-50 text-cyan-800 text-sm rounded-full border border-cyan-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
);

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;

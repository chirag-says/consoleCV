"use client";

// ConsoleCV - Space Theme Portfolio Component
// Deep Space themed portfolio with neon accents, glitch effects, and spotlight hover
// Converts ResumeData into an immersive developer showcase

import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
    Download,
    Github,
    Linkedin,
    Mail,
    ExternalLink,
    Calendar,
    Loader2,
    ChevronRight,
    Rocket,
    Code2,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { ResumeData } from "@/types/resume";
import { getTemplate } from "@/components/templates";
import StarField from "./StarField";

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
};

// =============================================================================
// SPOTLIGHT CARD COMPONENT
// =============================================================================

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
}

function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    }, []);

    return (
        <motion.div
            ref={cardRef}
            variants={fadeInUp}
            onMouseMove={handleMouseMove}
            className={`spotlight-card relative overflow-hidden rounded-2xl border border-white/10 bg-[#111928]/75 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/50 ${className}`}
            style={{
                background: `
                    radial-gradient(
                        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                        rgba(99, 102, 241, 0.1),
                        transparent 40%
                    ),
                    rgba(17, 25, 40, 0.75)
                `,
            }}
        >
            {children}
        </motion.div>
    );
}

// =============================================================================
// TECH PILL COMPONENT
// =============================================================================

interface TechPillProps {
    skill: string;
    index: number;
}

function TechPill({ skill, index }: TechPillProps) {
    const colors = [
        "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-300",
        "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-300",
        "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300",
        "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
        "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
    ];

    return (
        <motion.span
            variants={scaleIn}
            whileHover={{ scale: 1.1, y: -2 }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r border text-sm font-medium cursor-default transition-shadow hover:shadow-lg hover:shadow-indigo-500/20 ${colors[index % colors.length]}`}
        >
            <Code2 className="w-3.5 h-3.5" />
            {skill}
        </motion.span>
    );
}

// =============================================================================
// GLITCH TEXT COMPONENT
// =============================================================================

interface GlitchTextProps {
    text: string;
    className?: string;
}

function GlitchText({ text, className = "" }: GlitchTextProps) {
    return (
        <span className={`glitch-text relative inline-block ${className}`}>
            <span className="glitch-text-main">{text}</span>
            <span className="glitch-text-layer absolute top-0 left-0 text-pink-500 clip-glitch-1" aria-hidden="true">
                {text}
            </span>
            <span className="glitch-text-layer absolute top-0 left-0 text-cyan-500 clip-glitch-2" aria-hidden="true">
                {text}
            </span>
            <style jsx>{`
                .glitch-text:hover .glitch-text-layer {
                    animation: glitch-anim 0.3s infinite;
                }
                .clip-glitch-1 {
                    clip-path: inset(40% 0 61% 0);
                }
                .clip-glitch-2 {
                    clip-path: inset(65% 0 19% 0);
                }
                @keyframes glitch-anim {
                    0% { transform: translate(0); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(-2px, -2px); }
                    60% { transform: translate(2px, 2px); }
                    80% { transform: translate(2px, -2px); }
                    100% { transform: translate(0); }
                }
            `}</style>
        </span>
    );
}

// =============================================================================
// EXPERIENCE TIMELINE ITEM
// =============================================================================

interface TimelineItemProps {
    experience: ResumeData["experience"][0];
    index: number;
    isLast: boolean;
}

function TimelineItem({ experience, isLast }: TimelineItemProps) {
    return (
        <motion.div
            variants={fadeInUp}
            className="relative flex gap-6"
        >
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/50 z-10" />
                {!isLast && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-indigo-500/50 to-transparent mt-2" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
                <SpotlightCard className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-white">{experience.role}</h3>
                            <p className="text-indigo-400 font-medium">{experience.company}</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{experience.start} — {experience.end || "Present"}</span>
                        </div>
                    </div>
                    {experience.description && (
                        <div className="text-slate-300 text-sm leading-relaxed">
                            {experience.description.split(/[•\n]/).filter(Boolean).map((line, i) => (
                                <p key={i} className="flex items-start gap-2 mb-1">
                                    <ChevronRight className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                                    <span>{line.trim()}</span>
                                </p>
                            ))}
                        </div>
                    )}
                </SpotlightCard>
            </div>
        </motion.div>
    );
}

// =============================================================================
// PROJECT CARD COMPONENT
// =============================================================================

interface ProjectCardProps {
    project: ResumeData["projects"][0];
    index: number;
}

function ProjectCard({ project }: ProjectCardProps) {
    return (
        <SpotlightCard className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-indigo-400" />
                </div>
                {project.link && (
                    <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </a>
                )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>

            {project.description && (
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
                    {project.description.substring(0, 150)}
                    {project.description.length > 150 && "..."}
                </p>
            )}

            {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
                    {project.techStack.slice(0, 4).map((tech) => (
                        <span
                            key={tech}
                            className="px-2 py-1 text-xs rounded-md bg-white/5 text-slate-300 border border-white/10"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.techStack.length > 4 && (
                        <span className="px-2 py-1 text-xs rounded-md bg-white/5 text-slate-500">
                            +{project.techStack.length - 4}
                        </span>
                    )}
                </div>
            )}
        </SpotlightCard>
    );
}

// =============================================================================
// MAIN SPACE THEME COMPONENT
// =============================================================================

interface SpaceThemeProps {
    data: ResumeData;
}

export default function SpaceTheme({ data }: SpaceThemeProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const { personal, skills, experience, projects, education } = data;

    // Get GitHub avatar URL
    const avatarUrl = personal.github
        ? `https://github.com/${personal.github}.png`
        : null;

    // PDF Download handler
    const handleDownload = useCallback(async () => {
        setIsDownloading(true);

        try {
            const TemplateComponent = getTemplate(data.templateId);
            const blob = await pdf(<TemplateComponent data={data} />).toBlob();
            const fileName = `${personal.fullName || "Resume"}_Resume.pdf`;
            saveAs(blob, fileName);
        } catch (err) {
            console.error("[PDF Download] Error:", err);
        } finally {
            setIsDownloading(false);
        }
    }, [data, personal.fullName]);

    return (
        <div className="min-h-screen bg-[#030014] text-white overflow-hidden">
            {/* Starfield Background */}
            <StarField starCount={150} speed={0.3} />

            {/* Gradient Overlays */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center px-4 py-20">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-center max-w-4xl mx-auto"
                    >
                        {/* Avatar */}
                        {avatarUrl && (
                            <motion.div
                                variants={scaleIn}
                                className="mb-8"
                            >
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={avatarUrl}
                                        alt={personal.fullName}
                                        className="relative w-32 h-32 rounded-full border-4 border-indigo-500/50 shadow-2xl shadow-indigo-500/30"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Headline */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl sm:text-7xl font-extrabold mb-6"
                        >
                            <span className="text-slate-400">I&apos;m </span>
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {personal.fullName || "Developer"}
                            </span>
                        </motion.h1>

                        {/* Glitch Job Title */}
                        <motion.div variants={fadeInUp} className="mb-8">
                            <GlitchText
                                text="Full Stack Developer"
                                className="text-2xl sm:text-3xl font-bold text-slate-300"
                            />
                        </motion.div>

                        {/* Social Links */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex items-center justify-center gap-4 mb-10"
                        >
                            {personal.github && (
                                <a
                                    href={`https://github.com/${personal.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-all"
                                >
                                    <Github className="w-6 h-6" />
                                </a>
                            )}
                            {personal.linkedin && (
                                <a
                                    href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-all"
                                >
                                    <Linkedin className="w-6 h-6" />
                                </a>
                            )}
                            {personal.email && (
                                <a
                                    href={`mailto:${personal.email}`}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-all"
                                >
                                    <Mail className="w-6 h-6" />
                                </a>
                            )}
                        </motion.div>

                        {/* Download Button */}
                        <motion.div variants={fadeInUp}>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-60 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Download Resume
                                    </>
                                )}
                            </button>
                        </motion.div>

                        {/* Scroll Indicator */}
                        <motion.div
                            variants={fadeInUp}
                            className="mt-16"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <div className="w-6 h-10 rounded-full border-2 border-white/20 mx-auto flex justify-center pt-2">
                                <div className="w-1 h-2 bg-indigo-400 rounded-full" />
                            </div>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Technical Arsenal (Skills) */}
                {skills.length > 0 && (
                    <section className="py-20 px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="max-w-5xl mx-auto"
                        >
                            <motion.div variants={fadeInUp} className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                                        Technical Arsenal
                                    </span>
                                </h2>
                                <p className="text-slate-400">Technologies I wield in the digital frontier</p>
                            </motion.div>

                            <motion.div
                                variants={staggerContainer}
                                className="flex flex-wrap justify-center gap-3"
                            >
                                {skills.map((skill, index) => (
                                    <TechPill key={skill} skill={skill} index={index} />
                                ))}
                            </motion.div>
                        </motion.div>
                    </section>
                )}

                {/* Mission Log (Experience) */}
                {experience.length > 0 && (
                    <section className="py-20 px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="max-w-3xl mx-auto"
                        >
                            <motion.div variants={fadeInUp} className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                                        Mission Log
                                    </span>
                                </h2>
                                <p className="text-slate-400">Professional journey through the tech galaxy</p>
                            </motion.div>

                            <div className="relative">
                                {experience.map((exp, index) => (
                                    <TimelineItem
                                        key={index}
                                        experience={exp}
                                        index={index}
                                        isLast={index === experience.length - 1}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* Stellar Projects */}
                {projects.length > 0 && (
                    <section className="py-20 px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="max-w-6xl mx-auto"
                        >
                            <motion.div variants={fadeInUp} className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                                        Stellar Projects
                                    </span>
                                </h2>
                                <p className="text-slate-400">Creations launched into the digital universe</p>
                            </motion.div>

                            <motion.div
                                variants={staggerContainer}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {projects.map((project, index) => (
                                    <motion.div key={index} variants={fadeInUp}>
                                        <ProjectCard project={project} index={index} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <section className="py-20 px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="max-w-3xl mx-auto"
                        >
                            <motion.div variants={fadeInUp} className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                                        Academy Training
                                    </span>
                                </h2>
                                <p className="text-slate-400">Educational foundations</p>
                            </motion.div>

                            <motion.div variants={staggerContainer} className="space-y-4">
                                {education.map((edu, index) => (
                                    <SpotlightCard key={index} className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{edu.school}</h3>
                                                <p className="text-indigo-400">{edu.degree}</p>
                                            </div>
                                            <div className="text-slate-400 text-sm">
                                                {edu.start} — {edu.end}
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                ))}
                            </motion.div>
                        </motion.div>
                    </section>
                )}

                {/* Footer */}
                <footer className="py-12 px-4 border-t border-white/5">
                    <div className="max-w-5xl mx-auto text-center">
                        <p className="text-slate-500 text-sm">
                            Portfolio powered by{" "}
                            <a href="/" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                ConsoleCV
                            </a>
                            {" "}— Build your developer portfolio in minutes
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

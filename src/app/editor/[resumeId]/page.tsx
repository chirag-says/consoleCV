"use client";

// ConsoleCV - Editor Page
// Resume editor with real-time PDF preview using @react-pdf/renderer

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    Download,
    Save,
    FileText,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Loader2,
    ArrowLeft,
    Target,
    AlertCircle,
    Github,
    Globe,
} from "lucide-react";
import type { ResumeData, TemplateId, ThemeId } from "@/types/resume";
import { defaultResumeData } from "@/types/resume";
import {
    PersonalForm,
    EducationForm,
    ExperienceForm,
    ProjectsForm,
    SkillsForm,
    TemplateSelector,
    PortfolioThemeSelector,
    AtsAnalyzer,
} from "@/components/editor";
import GitHubImporter from "@/components/editor/GitHubImporter";
import type { Project } from "@/types/resume";

// Dynamically import PDF components to avoid SSR issues
const PdfPreview = dynamic(
    () => import("@/components/templates/PdfPreview").then((mod) => mod.PdfPreview),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-slate-900/50 rounded-lg">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        ),
    }
);

const PdfDownloadButton = dynamic(
    () => import("@/components/templates/PdfPreview").then((mod) => mod.PdfDownloadButton),
    {
        ssr: false,
        loading: () => (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-medium rounded-lg opacity-50"
            >
                <Download className="w-4 h-4" />
                Export
            </button>
        ),
    }
);

// Collapsible section component
interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function CollapsibleSection({
    title,
    icon,
    children,
    defaultOpen = true,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/30 backdrop-blur-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
            >
                <span className="flex items-center gap-2 text-white font-medium">
                    {icon}
                    {title}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
            </button>
            {isOpen && <div className="px-5 pb-5 pt-2">{children}</div>}
        </div>
    );
}

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const resumeId = params.resumeId as string;

    // Main resume data state
    const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isAtsOpen, setIsAtsOpen] = useState(false);
    const [isGitHubImporterOpen, setIsGitHubImporterOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch resume data
    useEffect(() => {
        const fetchResume = async () => {
            try {
                const res = await fetch(`/api/resume/${resumeId}`);
                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to fetch resume");
                }
                setResumeData(data.data);
            } catch (error) {
                console.error("Error loading resume:", error);
                setError(error instanceof Error ? error.message : "Failed to load resume");
            } finally {
                setIsLoading(false);
            }
        };

        if (resumeId) {
            fetchResume();
        }
    }, [resumeId]);

    // Update handlers for each section
    const updatePersonal = (personal: ResumeData["personal"]) => {
        setResumeData((prev) => ({ ...prev, personal }));
    };

    const updateEducation = (education: ResumeData["education"]) => {
        setResumeData((prev) => ({ ...prev, education }));
    };

    const updateExperience = (experience: ResumeData["experience"]) => {
        setResumeData((prev) => ({ ...prev, experience }));
    };

    const updateProjects = (projects: ResumeData["projects"]) => {
        setResumeData((prev) => ({ ...prev, projects }));
    };

    const updateSkills = (skills: ResumeData["skills"]) => {
        setResumeData((prev) => ({ ...prev, skills }));
    };

    const updateTemplate = (templateId: TemplateId) => {
        setResumeData((prev) => ({ ...prev, templateId }));
    };

    const updateTheme = (theme: ThemeId) => {
        setResumeData((prev) => ({ ...prev, theme }));
    };

    const updateSettings = (key: "isPublic" | "isPrimary", value: boolean) => {
        setResumeData((prev) => ({ ...prev, [key]: value }));
    };

    // Save to database
    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const response = await fetch(`/api/resume/${resumeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resumeData),
            });

            if (!response.ok) {
                throw new Error("Failed to save resume");
            }

            setSaveMessage("Saved successfully!");
            setTimeout(() => setSaveMessage(null), 3000);
        } catch {
            setSaveMessage("Failed to save.");
            setTimeout(() => setSaveMessage(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Unable to Load Resume</h2>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">ConsoleCV</h1>
                                    <input
                                        type="text"
                                        value={resumeData.title || "Untitled Resume"}
                                        onChange={(e) =>
                                            setResumeData({ ...resumeData, title: e.target.value })
                                        }
                                        className="text-xs text-slate-400 bg-transparent border-none p-0 focus:ring-0 w-48"
                                        placeholder="Resume Title"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {saveMessage && (
                                <span
                                    className={`text-sm ${saveMessage.includes("Saved")
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                        }`}
                                >
                                    {saveMessage}
                                </span>
                            )}
                            <button
                                onClick={() => setIsAtsOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-violet-500/20"
                            >
                                <Target className="w-4 h-4" />
                                ATS Check
                            </button>
                            <button
                                onClick={() => setIsGitHubImporterOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700"
                            >
                                <Github className="w-4 h-4" />
                                Import
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save
                            </button>
                            <PdfDownloadButton
                                data={resumeData}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </PdfDownloadButton>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Split Screen */}
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex gap-6">
                    {/* Left Side - Editor */}
                    <div className="w-1/2 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                        {/* Visibility Settings - manual control for Primary/Public */}
                        <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl space-y-3">
                            <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-indigo-400" />
                                Visibility Settings
                            </h3>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Public Portfolio</span>
                                <input
                                    type="checkbox"
                                    checked={!!resumeData.isPublic}
                                    onChange={(e) => updateSettings("isPublic", e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-offset-slate-800"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Set as Primary</span>
                                <input
                                    type="checkbox"
                                    checked={!!resumeData.isPrimary}
                                    onChange={(e) => updateSettings("isPrimary", e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-offset-slate-800"
                                />
                            </div>
                        </div>

                        {/* Template Selector */}
                        <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-xl">
                            <TemplateSelector
                                selectedTemplate={resumeData.templateId || "latex"}
                                onChange={updateTemplate}
                            />
                        </div>

                        {/* Portfolio Theme Selector */}
                        <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
                            <PortfolioThemeSelector
                                selectedTheme={resumeData.theme || "cyber"}
                                onChange={updateTheme}
                            />
                        </div>

                        {/* Smart Tips Banner */}
                        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-slate-200 font-medium">
                                        {resumeData.templateId === "modern" ? "Modern Two-Column Design" : "LaTeX-Style PDF Export"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {resumeData.templateId === "modern"
                                            ? "A sleek, two-column layout with dark sidebar. Perfect for modern tech roles."
                                            : "Your resume is rendered as a professional PDF using academic typography. Perfect for ATS systems and professional applications."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Sections */}
                        <CollapsibleSection
                            title="Personal Information"
                            icon={<span className="text-emerald-400">👤</span>}
                        >
                            <PersonalForm data={resumeData.personal} onChange={updatePersonal} />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Education"
                            icon={<span className="text-emerald-400">🎓</span>}
                        >
                            <EducationForm
                                data={resumeData.education}
                                onChange={updateEducation}
                            />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Experience"
                            icon={<span className="text-emerald-400">💼</span>}
                        >
                            <ExperienceForm
                                data={resumeData.experience}
                                onChange={updateExperience}
                            />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Projects"
                            icon={<span className="text-emerald-400">🚀</span>}
                        >
                            <ProjectsForm
                                data={resumeData.projects}
                                onChange={updateProjects}
                                githubUsername={resumeData.personal.github}
                            />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Skills"
                            icon={<span className="text-emerald-400">⚡</span>}
                        >
                            <SkillsForm data={resumeData.skills} onChange={updateSkills} />
                        </CollapsibleSection>
                    </div>

                    {/* Right Side - PDF Preview */}
                    <div className="w-1/2 sticky top-24">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50 h-[calc(100vh-10rem)]">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-semibold text-white">
                                    PDF Preview
                                </h2>
                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                    A4 • {resumeData.templateId === "modern" ? "Modern" : "LaTeX"} Style
                                </span>
                            </div>

                            {/* PDF Viewer Container */}
                            <div className="h-[calc(100%-3rem)] rounded-lg overflow-hidden bg-slate-800">
                                <PdfPreview data={resumeData} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ATS Analyzer Modal */}
            <AtsAnalyzer
                resumeData={resumeData}
                isOpen={isAtsOpen}
                onClose={() => setIsAtsOpen(false)}
                onImportData={(importedData) => {
                    // Merge imported data with existing resume metadata
                    setResumeData((prev) => ({
                        ...importedData,
                        _id: prev._id,
                        userId: prev.userId,
                        title: prev.title || importedData.personal?.fullName || "Imported Resume",
                        templateId: prev.templateId,
                    }));
                }}
            />

            {/* GitHub Importer Modal */}
            <GitHubImporter
                isOpen={isGitHubImporterOpen}
                onClose={() => setIsGitHubImporterOpen(false)}
                defaultUsername={resumeData.personal?.github || ""}
                onImport={(projects: Project[]) => {
                    // Append imported projects to existing projects
                    setResumeData((prev) => ({
                        ...prev,
                        projects: [...prev.projects, ...projects],
                    }));
                }}
            />
        </div>
    );
}


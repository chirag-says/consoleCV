"use client";

// InternDeck - Main Page
// Split-screen layout with Editor on left and Live Preview on right

import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Download,
  Save,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import type { ResumeData } from "@/types/resume";
import { defaultResumeData } from "@/types/resume";
import {
  PersonalForm,
  EducationForm,
  ExperienceForm,
  ProjectsForm,
  SkillsForm,
} from "@/components/editor";
import ResumePreview from "@/components/preview/ResumePreview";

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

export default function Home() {
  // Main resume data state
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Ref for the printable resume component
  const resumeRef = useRef<HTMLDivElement>(null);

  // React-to-print hook
  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${resumeData.personal.fullName || "Resume"}_InternDeck`,
  });

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

  // Save to database (placeholder - implement API route)
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        throw new Error("Failed to save resume");
      }

      setSaveMessage("Resume saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage("Failed to save. Please try again.");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">InternDeck</h1>
                <p className="text-xs text-slate-400">
                  Resume Builder for Software Interns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {saveMessage && (
                <span
                  className={`text-sm ${saveMessage.includes("success")
                      ? "text-green-400"
                      : "text-red-400"
                    }`}
                >
                  {saveMessage}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
              <button
                onClick={() => handlePrint()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium rounded-lg transition-all shadow-lg shadow-cyan-500/25"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Left Side - Editor */}
          <div className="w-1/2 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {/* Smart Tips Banner */}
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-200 font-medium">
                    Smart Suggestions Enabled
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Type keywords like &quot;React&quot;, &quot;Python&quot;, or
                    &quot;API&quot; in description fields to get bullet point
                    suggestions.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Sections */}
            <CollapsibleSection
              title="Personal Information"
              icon={<span className="text-cyan-400">👤</span>}
            >
              <PersonalForm data={resumeData.personal} onChange={updatePersonal} />
            </CollapsibleSection>

            <CollapsibleSection
              title="Education"
              icon={<span className="text-cyan-400">🎓</span>}
            >
              <EducationForm
                data={resumeData.education}
                onChange={updateEducation}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Experience"
              icon={<span className="text-cyan-400">💼</span>}
            >
              <ExperienceForm
                data={resumeData.experience}
                onChange={updateExperience}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Projects"
              icon={<span className="text-cyan-400">🚀</span>}
            >
              <ProjectsForm
                data={resumeData.projects}
                onChange={updateProjects}
                githubUsername={resumeData.personal.github}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Skills"
              icon={<span className="text-cyan-400">⚡</span>}
            >
              <SkillsForm data={resumeData.skills} onChange={updateSkills} />
            </CollapsibleSection>
          </div>

          {/* Right Side - Preview */}
          <div className="w-1/2 sticky top-24">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Live Preview
                </h2>
                <span className="text-xs text-slate-500">A4 Format</span>
              </div>

              {/* Preview Container with Scaled A4 */}
              <div className="overflow-auto max-h-[calc(100vh-14rem)] rounded-lg bg-slate-900/50">
                <div
                  className="origin-top-left"
                  style={{
                    transform: "scale(0.5)",
                    transformOrigin: "top center",
                    width: "200%",
                  }}
                >
                  <ResumePreview ref={resumeRef} data={resumeData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

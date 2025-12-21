"use client";

// ConsoleCV - Template Selector Component
// Allows users to switch between different PDF resume templates
// Features preview cards with visual indicators

import React from "react";
import { Check, Sparkles } from "lucide-react";
import type { TemplateId } from "@/types/resume";
import { templateInfo } from "@/components/templates";

// =============================================================================
// TYPES
// =============================================================================

interface TemplateSelectorProps {
    selectedTemplate: TemplateId;
    onChange: (templateId: TemplateId) => void;
    className?: string;
}

// =============================================================================
// TEMPLATE CARD COMPONENT
// =============================================================================

interface TemplateCardProps {
    id: TemplateId;
    name: string;
    description: string;
    preview: string;
    isSelected: boolean;
    onClick: () => void;
}

function TemplateCard({
    id,
    name,
    description,
    preview,
    isSelected,
    onClick,
}: TemplateCardProps) {
    return (
        <button
            onClick={onClick}
            className={`
                relative flex flex-col rounded-xl overflow-hidden transition-all duration-200
                border-2 text-left
                ${isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-[1.02]"
                    : "border-slate-700 hover:border-slate-600 hover:scale-[1.01]"
                }
            `}
        >
            {/* Preview Area */}
            <div
                className="h-24 w-full relative"
                style={{ background: preview }}
            >
                {/* Template Layout Preview */}
                <div className="absolute inset-2 flex gap-1 opacity-60">
                    {id === "latex" ? (
                        // LaTeX preview - single column with centered header
                        <div className="flex-1 flex flex-col">
                            <div className="h-3 bg-white/30 rounded-sm mb-1 mx-auto w-1/2" />
                            <div className="h-1.5 bg-white/20 rounded-sm mb-2 mx-auto w-3/4" />
                            <div className="flex-1 space-y-1">
                                <div className="h-1 bg-white/20 rounded-sm" />
                                <div className="h-1 bg-white/15 rounded-sm w-5/6" />
                                <div className="h-1 bg-white/20 rounded-sm" />
                                <div className="h-1 bg-white/15 rounded-sm w-4/5" />
                            </div>
                        </div>
                    ) : (
                        // Modern preview - two column layout
                        <>
                            <div className="w-1/3 bg-white/20 rounded-l-sm flex flex-col p-1 gap-1">
                                <div className="h-2 bg-white/40 rounded-sm" />
                                <div className="h-1 bg-white/30 rounded-sm w-2/3" />
                                <div className="mt-2 h-1 bg-white/30 rounded-sm" />
                                <div className="h-1 bg-white/30 rounded-sm w-4/5" />
                            </div>
                            <div className="flex-1 flex flex-col p-1 gap-1">
                                <div className="h-1.5 bg-white/30 rounded-sm w-3/4" />
                                <div className="h-1 bg-white/20 rounded-sm" />
                                <div className="h-1 bg-white/15 rounded-sm w-5/6" />
                                <div className="mt-1 h-1.5 bg-white/30 rounded-sm w-2/3" />
                                <div className="h-1 bg-white/20 rounded-sm" />
                            </div>
                        </>
                    )}
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}

                {/* New Badge for Modern template */}
                {id === "modern" && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-[10px] text-white font-medium flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        NEW
                    </div>
                )}
            </div>

            {/* Info Area */}
            <div className="p-3 bg-slate-800/50">
                <h3 className={`text-sm font-semibold ${isSelected ? "text-emerald-400" : "text-white"}`}>
                    {name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {description}
                </p>
            </div>
        </button>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TemplateSelector({
    selectedTemplate,
    onChange,
    className = "",
}: TemplateSelectorProps) {
    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-white">Choose Template</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {templateInfo.map((template) => (
                    <TemplateCard
                        key={template.id}
                        id={template.id}
                        name={template.name}
                        description={template.description}
                        preview={template.preview}
                        isSelected={selectedTemplate === template.id}
                        onClick={() => onChange(template.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export default TemplateSelector;

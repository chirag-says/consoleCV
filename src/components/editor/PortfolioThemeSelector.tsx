"use client";

// ConsoleCV - Portfolio Theme Selector
// Allows users to switch between different portfolio themes
// Features visual previews of each theme style

import React from "react";
import { Check, Palette, Globe, Rocket } from "lucide-react";
import type { ThemeId } from "@/types/resume";
import { THEME_INFO } from "@/lib/themes";

// =============================================================================
// TYPES
// =============================================================================

interface PortfolioThemeSelectorProps {
    selectedTheme: ThemeId;
    onChange: (theme: ThemeId) => void;
    className?: string;
}

// =============================================================================
// THEME CARD COMPONENT
// =============================================================================

interface ThemeCardProps {
    id: ThemeId;
    isSelected: boolean;
    onClick: () => void;
}

function ThemeCard({ id, isSelected, onClick }: ThemeCardProps) {
    const info = THEME_INFO[id];

    // Theme-specific preview styles
    const getPreviewContent = () => {
        switch (id) {
            case "cyber":
                return (
                    <div className="h-full w-full bg-slate-900 border border-slate-700/50 p-2 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                        <div className="flex items-center gap-1 mb-2">
                            <Rocket className="w-3 h-3 text-indigo-400" />
                            <div className="h-1 w-1/2 bg-slate-100/20 rounded" />
                        </div>
                        <div className="space-y-1">
                            <div className="h-3 w-full bg-slate-800 rounded border border-slate-700" />
                            <div className="h-3 w-full bg-slate-800 rounded border border-slate-700" />
                        </div>
                    </div>
                );
            case "terminal":
                return (
                    <div className="h-full w-full bg-black border border-emerald-900/50 p-2 overflow-hidden font-mono text-[8px] leading-tight relative">
                        {/* Neural network nodes preview */}
                        <div className="absolute inset-0">
                            <div className="absolute top-2 left-3 w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
                            <div className="absolute top-4 right-4 w-1 h-1 rounded-full bg-emerald-400/60" />
                            <div className="absolute bottom-3 left-5 w-1 h-1 rounded-full bg-emerald-500/40" />
                            <div className="absolute bottom-4 right-3 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
                            {/* Connection lines */}
                            <svg className="absolute inset-0 w-full h-full opacity-30">
                                <line x1="12" y1="8" x2="60" y2="16" stroke="#10b981" strokeWidth="0.5" />
                                <line x1="20" y1="52" x2="56" y2="48" stroke="#10b981" strokeWidth="0.5" />
                            </svg>
                        </div>
                        {/* Terminal content */}
                        <div className="relative z-10">
                            <div className="flex gap-1 mb-1 opacity-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_3px_rgba(239,68,68,0.5)]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_3px_rgba(234,179,8,0.5)]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_3px_rgba(16,185,129,0.5)]" />
                            </div>
                            <div className="text-emerald-400" style={{ textShadow: '0 0 4px rgba(16,185,129,0.5)' }}>{">"} init_dev</div>
                            <div className="text-zinc-500 mt-1">{"{"}</div>
                            <div className="pl-1 text-blue-400">&quot;fx&quot;: &quot;neon&quot;</div>
                            <div className="text-zinc-500">{"}"}</div>
                        </div>
                    </div>
                );
            case "minimal":
                return (
                    <div className="h-full w-full bg-white border border-gray-100 p-2 overflow-hidden">
                        <div className="flex items-center gap-1 mb-2 border-b border-gray-100 pb-1">
                            <Globe className="w-3 h-3 text-gray-900" />
                            <div className="h-1 w-1/3 bg-gray-900 rounded" />
                        </div>
                        <div className="space-y-1">
                            <div className="h-0.5 w-full bg-gray-200" />
                            <div className="h-0.5 w-4/5 bg-gray-200" />
                            <div className="h-0.5 w-full bg-gray-200" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <button
            onClick={onClick}
            className={`
                relative flex flex-col rounded-xl overflow-hidden transition-all duration-200
                border-2 text-left group
                ${isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-[1.02]"
                    : "border-slate-700 hover:border-slate-600 hover:scale-[1.01]"
                }
            `}
        >
            {/* Preview Area */}
            <div className="h-20 w-full relative">
                {getPreviewContent()}

                {/* Selected Indicator */}
                {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            {/* Info Area */}
            <div className="p-3 bg-slate-800/50 w-full flex-1">
                <h3 className={`text-sm font-semibold ${isSelected ? "text-emerald-400" : "text-white"}`}>
                    {info.name}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    {info.description}
                </p>
            </div>
        </button>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PortfolioThemeSelector({
    selectedTheme,
    onChange,
    className = "",
}: PortfolioThemeSelectorProps) {
    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-white">Public Portfolio Theme</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {(Object.keys(THEME_INFO) as ThemeId[]).map((id) => (
                    <ThemeCard
                        key={id}
                        id={id}
                        isSelected={selectedTheme === id}
                        onClick={() => onChange(id)}
                    />
                ))}
            </div>

            <p className="text-xs text-slate-500 mt-2 italic">
                * This updates your public portfolio link immediately.
            </p>
        </div>
    );
}

export default PortfolioThemeSelector;

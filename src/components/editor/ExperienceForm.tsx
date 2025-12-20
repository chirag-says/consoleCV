"use client";

// InternDeck - Experience Form Component
// Manages work experience entries with smart textarea for descriptions

import React from "react";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import type { Experience } from "@/types/resume";
import SmartTextarea from "@/components/ui/SmartTextarea";

interface ExperienceFormProps {
    data: Experience[];
    onChange: (data: Experience[]) => void;
}

const emptyExperience: Experience = {
    company: "",
    role: "",
    description: "",
    start: "",
    end: "",
};

export default function ExperienceForm({
    data,
    onChange,
}: ExperienceFormProps) {
    const addExperience = () => {
        onChange([...data, { ...emptyExperience }]);
    };

    const removeExperience = (index: number) => {
        onChange(data.filter((_, i) => i !== index));
    };

    const updateExperience = (
        index: number,
        field: keyof Experience,
        value: string
    ) => {
        const updated = data.map((exp, i) =>
            i === index ? { ...exp, [field]: value } : exp
        );
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    Experience
                </h2>
                <button
                    onClick={addExperience}
                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-lg">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No experience added yet</p>
                    <button
                        onClick={addExperience}
                        className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                        Add your first experience
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((exp, index) => (
                        <div
                            key={index}
                            className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg space-y-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-400">
                                    Experience #{index + 1}
                                </span>
                                <button
                                    onClick={() => removeExperience(index)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Company & Role */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) =>
                                            updateExperience(index, "company", e.target.value)
                                        }
                                        placeholder="Google"
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.role}
                                        onChange={(e) =>
                                            updateExperience(index, "role", e.target.value)
                                        }
                                        placeholder="Software Engineer Intern"
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">
                                        Start Date
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.start}
                                        onChange={(e) =>
                                            updateExperience(index, "start", e.target.value)
                                        }
                                        placeholder="May 2023"
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">
                                        End Date
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.end}
                                        onChange={(e) =>
                                            updateExperience(index, "end", e.target.value)
                                        }
                                        placeholder="Aug 2023"
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Description with Smart Textarea */}
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-400">
                                    Description{" "}
                                    <span className="text-cyan-400">
                                        (type keywords like &quot;React&quot; for suggestions)
                                    </span>
                                </label>
                                <SmartTextarea
                                    value={exp.description}
                                    onChange={(value) =>
                                        updateExperience(index, "description", value)
                                    }
                                    placeholder="• Describe your responsibilities and achievements..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

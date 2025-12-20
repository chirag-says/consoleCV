"use client";

// InternDeck - Education Form Component
// Manages multiple education entries

import React from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import type { Education } from "@/types/resume";

interface EducationFormProps {
    data: Education[];
    onChange: (data: Education[]) => void;
}

const emptyEducation: Education = {
    school: "",
    degree: "",
    start: "",
    end: "",
};

export default function EducationForm({ data, onChange }: EducationFormProps) {
    const addEducation = () => {
        onChange([...data, { ...emptyEducation }]);
    };

    const removeEducation = (index: number) => {
        onChange(data.filter((_, i) => i !== index));
    };

    const updateEducation = (
        index: number,
        field: keyof Education,
        value: string
    ) => {
        const updated = data.map((edu, i) =>
            i === index ? { ...edu, [field]: value } : edu
        );
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                    Education
                </h2>
                <button
                    onClick={addEducation}
                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-lg">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No education added yet</p>
                    <button
                        onClick={addEducation}
                        className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                        Add your first education
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((edu, index) => (
                        <div
                            key={index}
                            className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg space-y-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-400">
                                    Education #{index + 1}
                                </span>
                                <button
                                    onClick={() => removeEducation(index)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* School Name */}
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-400">
                                    School / University
                                </label>
                                <input
                                    type="text"
                                    value={edu.school}
                                    onChange={(e) =>
                                        updateEducation(index, "school", e.target.value)
                                    }
                                    placeholder="Stanford University"
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Degree */}
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-400">
                                    Degree
                                </label>
                                <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) =>
                                        updateEducation(index, "degree", e.target.value)
                                    }
                                    placeholder="B.S. Computer Science"
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">
                                        Start Date
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.start}
                                        onChange={(e) =>
                                            updateEducation(index, "start", e.target.value)
                                        }
                                        placeholder="Sep 2020"
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">
                                        End Date
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.end}
                                        onChange={(e) =>
                                            updateEducation(index, "end", e.target.value)
                                        }
                                        placeholder="May 2024"
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

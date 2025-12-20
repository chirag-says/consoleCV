"use client";

// InternDeck - Skills Form Component
// Manages skills as tags with add/remove functionality

import React, { useState, KeyboardEvent } from "react";
import { Zap, Plus, X } from "lucide-react";

interface SkillsFormProps {
    data: string[];
    onChange: (data: string[]) => void;
}

// Suggested skills for quick adding
const SUGGESTED_SKILLS = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "Git",
    "Docker",
    "AWS",
    "SQL",
    "MongoDB",
];

export default function SkillsForm({ data, onChange }: SkillsFormProps) {
    const [inputValue, setInputValue] = useState("");

    const addSkill = (skill: string) => {
        const trimmedSkill = skill.trim();
        if (trimmedSkill && !data.includes(trimmedSkill)) {
            onChange([...data, trimmedSkill]);
        }
        setInputValue("");
    };

    const removeSkill = (index: number) => {
        onChange(data.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkill(inputValue);
        }
    };

    const availableSuggestions = SUGGESTED_SKILLS.filter(
        (skill) => !data.includes(skill)
    );

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Skills
            </h2>

            {/* Skill Input */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                    Add a skill <span className="text-slate-500">(press Enter)</span>
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. React, Python, Docker"
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                    <button
                        onClick={() => addSkill(inputValue)}
                        disabled={!inputValue.trim()}
                        className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Current Skills */}
            {data.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Your Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {data.map((skill, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 text-cyan-300 text-sm rounded-full"
                            >
                                {skill}
                                <button
                                    onClick={() => removeSkill(index)}
                                    className="p-0.5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Add Suggestions */}
            {availableSuggestions.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">
                        Quick Add
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availableSuggestions.slice(0, 8).map((skill) => (
                            <button
                                key={skill}
                                onClick={() => addSkill(skill)}
                                className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 text-slate-400 text-sm rounded-full hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-colors"
                            >
                                + {skill}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

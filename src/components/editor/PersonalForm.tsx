"use client";

// InternDeck - Personal Information Form Component
// Collects basic contact and profile information

import React from "react";
import { User, Mail, Github, Linkedin, Phone } from "lucide-react";
import type { PersonalInfo } from "@/types/resume";

interface PersonalFormProps {
    data: PersonalInfo;
    onChange: (data: PersonalInfo) => void;
}

export default function PersonalForm({ data, onChange }: PersonalFormProps) {
    const handleChange = (field: keyof PersonalInfo, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Personal Information
            </h2>

            {/* Full Name */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                    Full Name
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={data.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                    Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                    Phone
                </label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* GitHub */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                    GitHub Username
                </label>
                <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={data.github}
                        onChange={(e) => handleChange("github", e.target.value)}
                        placeholder="johndoe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                    LinkedIn URL
                </label>
                <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="url"
                        value={data.linkedin}
                        onChange={(e) => handleChange("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/in/johndoe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>
        </div>
    );
}

"use client";

// InternDeck - Personal Information Form Component
// Collects basic contact and profile information

import React, { useEffect } from "react";
import { User, Mail, Github, Linkedin, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PersonalInfo } from "@/types/resume";
import { personalInfoSchema } from "@/lib/validations";

import { z } from "zod";

interface PersonalFormProps {
    data: PersonalInfo;
    onChange: (data: PersonalInfo) => void;
}

type PersonalFormValues = z.infer<typeof personalInfoSchema>;

export default function PersonalForm({ data, onChange }: PersonalFormProps) {
    const {
        register,
        formState: { errors },
        watch,
        reset,
    } = useForm<PersonalFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(personalInfoSchema) as any,
        defaultValues: data,
        mode: "onChange",
    });

    // Update parent when form values change
    useEffect(() => {
        const subscription = watch((value) => {
            // value might differ slightly in types (undefined vs string), cast as needed
            onChange(value as PersonalInfo);
        });
        return () => subscription.unsubscribe();
    }, [watch, onChange]);

    // Update form if initial data changes (e.g. loaded from API)
    useEffect(() => {
        if (data) {
            reset(data);
        }
    }, [data, reset]);

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
                        {...register("fullName")}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.fullName ? "border-red-500/50" : "border-slate-700"
                            }`}
                    />
                </div>
                {errors.fullName && (
                    <p className="text-red-400 text-xs">{errors.fullName.message}</p>
                )}
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
                        {...register("email")}
                        placeholder="john@example.com"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.email ? "border-red-500/50" : "border-slate-700"
                            }`}
                    />
                </div>
                {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email.message}</p>
                )}
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
                        {...register("phone")}
                        placeholder="+1 (555) 123-4567"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.phone ? "border-red-500/50" : "border-slate-700"
                            }`}
                    />
                </div>
                {errors.phone && (
                    <p className="text-red-400 text-xs">{errors.phone.message}</p>
                )}
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
                        {...register("github")}
                        placeholder="johndoe"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.github ? "border-red-500/50" : "border-slate-700"
                            }`}
                    />
                </div>
                {errors.github && (
                    <p className="text-red-400 text-xs">{errors.github.message}</p>
                )}
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
                        {...register("linkedin")}
                        placeholder="https://linkedin.com/in/johndoe"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.linkedin ? "border-red-500/50" : "border-slate-700"
                            }`}
                    />
                </div>
                {errors.linkedin && (
                    <p className="text-red-400 text-xs">{errors.linkedin.message}</p>
                )}
            </div>
        </div>
    );
}

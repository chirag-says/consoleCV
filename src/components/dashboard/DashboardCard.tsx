"use client";

// ConsoleCV - Dashboard Card Component
// Reusable card component for dashboard quick actions

import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface DashboardCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "primary" | "gradient";
    badge?: string;
    disabled?: boolean;
    loading?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DashboardCard({
    title,
    description,
    icon: Icon,
    href,
    onClick,
    variant = "default",
    badge,
    disabled = false,
    loading = false,
}: DashboardCardProps) {
    // Variant styles
    const variants = {
        default: {
            container: "bg-slate-900/40 border-slate-800/60 hover:border-slate-700",
            icon: "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300",
            title: "text-slate-200 group-hover:text-white",
            description: "text-slate-500 group-hover:text-slate-400",
            accent: "bg-slate-500",
        },
        primary: {
            container: "bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-900/10",
            icon: "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110",
            title: "text-emerald-50 group-hover:text-white",
            description: "text-emerald-500/60 group-hover:text-emerald-500/80",
            accent: "bg-emerald-500",
        },
        gradient: {
            container: "bg-violet-950/10 border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-900/10",
            icon: "bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 group-hover:scale-110",
            title: "text-violet-50 group-hover:text-white",
            description: "text-violet-500/60 group-hover:text-violet-500/80",
            accent: "bg-violet-500",
        },
    };

    const styles = variants[variant];

    const cardContent = (
        <>
            {/* Top Row */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${styles.icon}`}>
                    {loading ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                    )}
                </div>
                {badge && (
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${variant === 'default' ? 'bg-slate-800 border-slate-700 text-slate-400' :
                        variant === 'primary' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            'bg-violet-500/10 border-violet-500/20 text-violet-400'
                        }`}>
                        {badge}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10">
                <h3 className={`text-base sm:text-xl font-bold mb-1.5 sm:mb-2 transition-colors duration-300 ${styles.title}`}>
                    {title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${styles.description}`}>
                    {description}
                </p>
            </div>

            {/* Hover Action Indicator */}
            <div className="mt-4 sm:mt-8 flex items-center text-xs font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span className={styles.title}>Open</span>
                <ArrowRight className={`w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1 ${variant === 'primary' ? 'text-emerald-400' :
                    variant === 'gradient' ? 'text-violet-400' :
                        'text-slate-400'
                    }`} />
            </div>

            {/* Decorative Gradient Blob */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${styles.accent}`} />
        </>
    );

    const baseClasses = `
        group relative p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border backdrop-blur-sm transition-all duration-300 overflow-hidden text-left w-full h-full
        ${styles.container}
        ${disabled ? "opacity-50 pointer-events-none grayscale" : "hover:shadow-2xl hover:-translate-y-1"}
    `;

    // Render as Link or button based on props
    if (href) {
        return (
            <Link href={href} className={baseClasses}>
                {cardContent}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={baseClasses} disabled={disabled}>
            {cardContent}
        </button>
    );
}

export default DashboardCard;

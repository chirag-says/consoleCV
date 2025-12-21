// ConsoleCV - Template Registry
// Central registry for all PDF resume templates
// Allows dynamic template switching at runtime

import React from "react";
import type { ResumeData, TemplateId } from "@/types/resume";

// Import all templates
import LatexPdfTemplate from "./LatexPdfTemplate";
import ModernPdfTemplate from "./ModernPdfTemplate";

// =============================================================================
// TEMPLATE TYPES
// =============================================================================

export interface TemplateProps {
    data: ResumeData;
}

// Use ComponentType for compatibility with React.FC
export type TemplateComponent = React.ComponentType<TemplateProps>;

export interface TemplateInfo {
    id: TemplateId;
    name: string;
    description: string;
    preview: string; // CSS gradient or color for preview card
    component: TemplateComponent;
}

// =============================================================================
// TEMPLATE REGISTRY
// =============================================================================

/**
 * Registry of all available PDF templates
 * Maps template IDs to their respective React-PDF components
 */
export const templates: Record<TemplateId, TemplateComponent> = {
    latex: LatexPdfTemplate,
    modern: ModernPdfTemplate,
};

/**
 * Metadata for each template (used for Template Selector UI)
 */
export const templateInfo: TemplateInfo[] = [
    {
        id: "latex",
        name: "LaTeX Classic",
        description: "Academic style with Times Roman serif typography. Perfect for research and traditional industries.",
        preview: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        component: LatexPdfTemplate,
    },
    {
        id: "modern",
        name: "Modern Deedy",
        description: "Two-column layout with dark sidebar. Clean, professional, and ATS-friendly.",
        preview: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #334155 100%)",
        component: ModernPdfTemplate,
    },
];

/**
 * Get template component by ID with fallback to latex
 */
export function getTemplate(templateId?: TemplateId): TemplateComponent {
    if (!templateId || !templates[templateId]) {
        return templates.latex;
    }
    return templates[templateId];
}

/**
 * Get template info by ID
 */
export function getTemplateInfo(templateId?: TemplateId): TemplateInfo | undefined {
    return templateInfo.find((t) => t.id === templateId);
}

// Default export for convenience
export default templates;

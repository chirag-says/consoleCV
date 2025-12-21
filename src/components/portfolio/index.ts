// ConsoleCV - Portfolio Templates Registry
// Central registry for portfolio theme components
// Allows dynamic theme switching based on user preference

import type { ResumeData } from "@/types/resume";
import SpaceTheme from "./SpaceTheme";

// =============================================================================
// TYPES
// =============================================================================

export interface PortfolioThemeProps {
    data: ResumeData;
}

export type PortfolioThemeComponent = React.ComponentType<PortfolioThemeProps>;

export type PortfolioThemeId = "space" | "minimal" | "corporate";

export interface PortfolioThemeInfo {
    id: PortfolioThemeId;
    name: string;
    description: string;
    preview: string;
    component: PortfolioThemeComponent;
}

// =============================================================================
// THEME REGISTRY
// =============================================================================

/**
 * Registry of all available portfolio themes
 */
export const portfolioThemes: Record<PortfolioThemeId, PortfolioThemeComponent> = {
    space: SpaceTheme,
    minimal: SpaceTheme, // TODO: Create MinimalTheme
    corporate: SpaceTheme, // TODO: Create CorporateTheme
};

/**
 * Metadata for each theme (for theme selector UI)
 */
export const portfolioThemeInfo: PortfolioThemeInfo[] = [
    {
        id: "space",
        name: "Deep Space",
        description: "Immersive dark theme with neon accents, starfield background, and futuristic vibes.",
        preview: "linear-gradient(135deg, #030014 0%, #1a1a2e 50%, #16213e 100%)",
        component: SpaceTheme,
    },
    {
        id: "minimal",
        name: "Minimal Clean",
        description: "Clean, typography-focused design with subtle animations.",
        preview: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        component: SpaceTheme, // TODO: Replace with MinimalTheme
    },
    {
        id: "corporate",
        name: "Corporate Pro",
        description: "Professional, business-oriented design for enterprise roles.",
        preview: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        component: SpaceTheme, // TODO: Replace with CorporateTheme
    },
];

/**
 * Get portfolio theme component by ID with fallback to space
 */
export function getPortfolioTheme(themeId?: PortfolioThemeId): PortfolioThemeComponent {
    if (!themeId || !portfolioThemes[themeId]) {
        return portfolioThemes.space;
    }
    return portfolioThemes[themeId];
}

/**
 * Get theme info by ID
 */
export function getPortfolioThemeInfo(themeId?: PortfolioThemeId): PortfolioThemeInfo | undefined {
    return portfolioThemeInfo.find((t) => t.id === themeId);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { SpaceTheme };
export { default as StarField } from "./StarField";

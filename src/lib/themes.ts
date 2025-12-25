// ConsoleCV - Theme Constants
// Portfolio theme definitions and utilities

export const THEMES = {
    CYBER: "cyber",
    TERMINAL: "terminal",
    MINIMAL: "minimal",
} as const;

export type ThemeId = (typeof THEMES)[keyof typeof THEMES];

export const THEME_INFO: Record<ThemeId, { name: string; description: string }> = {
    cyber: {
        name: "Cyber Dark",
        description: "Professional dark theme with subtle neon accents",
    },
    terminal: {
        name: "Terminal",
        description: "Futuristic console with neural network & neon effects",
    },
    minimal: {
        name: "Minimal",
        description: "Clean, print-friendly design with maximum readability",
    },
};

export const DEFAULT_THEME: ThemeId = THEMES.CYBER;

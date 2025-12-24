// ConsoleCV - Resume Data Types
// This interface defines the complete structure for resume data

export interface PersonalInfo {
    fullName: string;
    email: string;
    github: string;
    linkedin: string;
    phone: string;
    summary?: string;
}

export interface Education {
    school: string;
    degree: string;
    start: string;
    end: string;
}

export interface Experience {
    company: string;
    role: string;
    description: string;
    start: string;
    end: string;
}

export interface Project {
    title: string;
    description: string;
    techStack: string[];
    link: string;
}

// Template ID type for type-safe template selection
export type TemplateId = "latex" | "modern";

// Theme ID type for portfolio themes
export type ThemeId = "cyber" | "terminal" | "minimal";

export interface ResumeData {
    _id?: string;
    userId?: string;
    title?: string;
    templateId?: TemplateId;
    theme?: ThemeId;
    isPrimary?: boolean;
    isPublic?: boolean;
    slug?: string;
    personal: PersonalInfo;
    education: Education[];
    experience: Experience[];
    projects: Project[];
    skills: string[];
}

// Default empty resume data for initialization
export const defaultResumeData: ResumeData = {
    personal: {
        fullName: "",
        email: "",
        github: "",
        linkedin: "",
        phone: "",
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
};

// GitHub Repository type for the import feature
export interface GitHubRepo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    topics: string[];
    language: string | null;
    stargazers_count: number;
    fork: boolean;
}

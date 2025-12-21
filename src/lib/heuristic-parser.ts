// ConsoleCV - Heuristic Resume Parser
// Client-side resume parsing using RegEx and string manipulation
// Converts raw PDF text into structured ResumeData without any API calls

import type {
    ResumeData,
    PersonalInfo,
    Education,
    Experience,
    Project,
} from "@/types/resume";

// =============================================================================
// SECTION HEADER SYNONYMS
// =============================================================================

const SECTION_HEADERS = {
    education: [
        "education",
        "academic",
        "academics",
        "university",
        "school",
        "qualification",
        "qualifications",
        "degree",
        "degrees",
        "educational background",
        "academic background",
    ],
    experience: [
        "experience",
        "employment",
        "work history",
        "work experience",
        "professional experience",
        "career history",
        "jobs",
        "positions",
        "employment history",
    ],
    skills: [
        "skills",
        "technologies",
        "technical skills",
        "tech stack",
        "stack",
        "languages",
        "programming languages",
        "tools",
        "expertise",
        "competencies",
        "proficiencies",
        "core competencies",
    ],
    projects: [
        "projects",
        "personal projects",
        "side projects",
        "portfolio",
        "work samples",
        "notable projects",
        "selected projects",
    ],
};

// =============================================================================
// TECH KEYWORDS FOR SKILLS EXTRACTION (50+ common tech terms)
// =============================================================================

const TECH_KEYWORDS: string[] = [
    // Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go",
    "Golang", "Rust", "Swift", "Kotlin", "PHP", "Scala", "Perl", "R",
    // Frontend
    "React", "Vue", "Angular", "Next.js", "Nuxt", "Svelte", "HTML", "CSS",
    "SASS", "SCSS", "Tailwind", "Bootstrap", "jQuery", "Redux", "Zustand",
    // Backend
    "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring", "Rails",
    "Laravel", "ASP.NET", "NestJS", "Fastify",
    // Databases
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "SQLite",
    "Firebase", "Supabase", "DynamoDB", "Cassandra", "Neo4j",
    // Cloud & DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins",
    "GitHub Actions", "CI/CD", "Linux", "Nginx", "Apache",
    // Mobile
    "React Native", "Flutter", "iOS", "Android", "SwiftUI", "Jetpack Compose",
    // AI/ML
    "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "OpenAI",
    "LangChain", "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    // Other Tools
    "Git", "REST", "GraphQL", "WebSocket", "OAuth", "JWT", "Figma",
    "Jira", "Agile", "Scrum", "VS Code", "Vim", "Postman",
];

// =============================================================================
// REGEX PATTERNS
// =============================================================================

const PATTERNS = {
    // Email: standard email format
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,

    // Phone: various international formats
    phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}(?:[-.\s]?\d{1,4})?/,

    // GitHub URL
    github: /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)\/?/i,

    // LinkedIn URL
    linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/i,

    // Generic URL
    url: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi,

    // Date patterns (various formats)
    dateRange: /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(?:\d{4}|\d{1,2}\/\d{2,4})\s*[-–—to]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(?:\d{4}|\d{1,2}\/\d{2,4}|present|current|now|ongoing)/gi,

    // Single date
    singleDate: /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:20\d{2}|19\d{2})/gi,

    // Degree patterns
    degree: /(?:bachelor['']?s?|master['']?s?|ph\.?d\.?|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?tech\.?|m\.?tech\.?|b\.?e\.?|m\.?e\.?|associate['']?s?)(?:\s+(?:of|in)\s+[\w\s]+)?/gi,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Normalize text for consistent processing
 */
function normalizeText(text: string): string {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\t/g, " ")
        .replace(/[ ]{2,}/g, " ")
        .trim();
}

/**
 * Check if a line looks like a section header
 * (Short line, often capitalized, may contain header keywords)
 */
function isSectionHeader(line: string, lowerLine: string): boolean {
    const trimmed = line.trim();

    // Empty or too long to be a header
    if (!trimmed || trimmed.length > 50) return false;

    // Check if line is mostly uppercase or starts with uppercase
    const isUppercase = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
    const startsWithCaps = /^[A-Z][A-Z\s&]+$/.test(trimmed);

    // Check against known headers
    for (const headers of Object.values(SECTION_HEADERS)) {
        for (const header of headers) {
            if (lowerLine.includes(header)) {
                // If it's short and contains a header keyword, it's likely a header
                if (trimmed.length <= 40 || isUppercase || startsWithCaps) {
                    return true;
                }
            }
        }
    }

    // Check for common header patterns (like "SECTION:" or "Section")
    if (/^[A-Z][A-Z\s]+:?$/.test(trimmed)) return true;
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:?$/.test(trimmed) && trimmed.length <= 30) return true;

    return false;
}

/**
 * Identify which section type a header belongs to
 */
function identifySectionType(line: string): keyof typeof SECTION_HEADERS | null {
    const lowerLine = line.toLowerCase();

    for (const [sectionType, headers] of Object.entries(SECTION_HEADERS)) {
        for (const header of headers) {
            if (lowerLine.includes(header)) {
                return sectionType as keyof typeof SECTION_HEADERS;
            }
        }
    }
    return null;
}

/**
 * Extract dates from text using various patterns
 */
function extractDates(text: string): { start: string; end: string } {
    // Try to find date ranges first
    const rangeMatch = text.match(PATTERNS.dateRange);
    if (rangeMatch && rangeMatch[0]) {
        const parts = rangeMatch[0].split(/[-–—]|to/i).map(p => p.trim());
        return {
            start: parts[0] || "",
            end: parts[1] || "Present",
        };
    }

    // Try to find individual dates
    const dateMatches = text.match(PATTERNS.singleDate);
    if (dateMatches && dateMatches.length >= 2) {
        return { start: dateMatches[0], end: dateMatches[1] };
    }
    if (dateMatches && dateMatches.length === 1) {
        return { start: dateMatches[0], end: "Present" };
    }

    return { start: "", end: "" };
}

/**
 * Parse the first few lines for personal info (name is usually first)
 */
function extractPersonalInfo(lines: string[], fullText: string): PersonalInfo {
    const personal: PersonalInfo = {
        fullName: "",
        email: "",
        github: "",
        linkedin: "",
        phone: "",
    };

    // Email
    const emailMatch = fullText.match(PATTERNS.email);
    if (emailMatch) {
        personal.email = emailMatch[0].toLowerCase();
    }

    // Phone (find in first 15 lines typically)
    const headerArea = lines.slice(0, 15).join(" ");
    const phoneMatch = headerArea.match(PATTERNS.phone);
    if (phoneMatch) {
        // Clean up the phone number
        personal.phone = phoneMatch[0].replace(/\s+/g, " ").trim();
    }

    // GitHub
    const githubMatch = fullText.match(PATTERNS.github);
    if (githubMatch) {
        personal.github = githubMatch[1] || "";
    }

    // LinkedIn
    const linkedinMatch = fullText.match(PATTERNS.linkedin);
    if (linkedinMatch) {
        personal.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
    }

    // Name - typically the first substantive line
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();

        // Skip empty lines or lines that look like contact info
        if (!line) continue;
        if (PATTERNS.email.test(line)) continue;
        if (PATTERNS.phone.test(line)) continue;
        if (PATTERNS.url.test(line)) continue;
        if (/^\+?\d/.test(line)) continue; // Starts with phone-like number

        // If it looks like a name (2-5 words, proper cased or all caps)
        const words = line.split(/\s+/);
        if (words.length >= 1 && words.length <= 5) {
            // Check for name-like patterns
            const looksLikeName = words.every(
                w => /^[A-Z][a-z]*$/.test(w) || /^[A-Z]+$/.test(w) || /^[A-Z][a-z]+$/.test(w)
            );
            if (looksLikeName || line.length <= 40) {
                personal.fullName = line
                    .split(" ")
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(" ");
                break;
            }
        }
    }

    return personal;
}

/**
 * Parse education section content
 */
function parseEducation(content: string): Education[] {
    const education: Education[] = [];
    const lines = content.split("\n").filter(l => l.trim());

    if (lines.length === 0) return education;

    // Group lines into education entries (heuristic: look for degree patterns or institutions)
    let currentEntry: Partial<Education> = {};
    let entryLines: string[] = [];

    const processEntry = () => {
        if (entryLines.length === 0) return;

        const combined = entryLines.join(" ");
        const dates = extractDates(combined);

        // Find degree
        const degreeMatch = combined.match(PATTERNS.degree);
        const degree = degreeMatch ? degreeMatch[0] : "";

        // School is often on a separate line or before/after the degree
        // Take the longest line as school name (heuristic)
        let school = "";
        for (const line of entryLines) {
            const cleanLine = line.replace(PATTERNS.degree, "").replace(PATTERNS.dateRange, "").trim();
            if (cleanLine.length > school.length && !PATTERNS.email.test(line)) {
                school = cleanLine;
            }
        }

        if (school || degree) {
            education.push({
                school: school.replace(/[-–—,|]/g, " ").replace(/\s+/g, " ").trim(),
                degree: degree,
                start: dates.start,
                end: dates.end,
            });
        }

        entryLines = [];
        currentEntry = {};
    };

    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        // Check if this might be a new education entry
        const hasDegreeKeyword = PATTERNS.degree.test(line);
        const hasDatePattern = PATTERNS.dateRange.test(line) || PATTERNS.singleDate.test(line);

        // If we have accumulated lines and this looks like a new entry
        if (entryLines.length > 0 && (hasDegreeKeyword || hasDatePattern) && entryLines.length >= 2) {
            processEntry();
        }

        entryLines.push(line);
    }

    // Process remaining entry
    processEntry();

    return education;
}

/**
 * Parse experience section content
 */
function parseExperience(content: string): Experience[] {
    const experience: Experience[] = [];
    const lines = content.split("\n").filter(l => l.trim());

    if (lines.length === 0) return experience;

    let currentEntry: Partial<Experience> = {};
    let entryLines: string[] = [];
    let descriptionLines: string[] = [];

    const processEntry = () => {
        if (entryLines.length === 0) return;

        const headerArea = entryLines.slice(0, 3).join(" ");
        const dates = extractDates(headerArea);

        // First line is typically company or role
        const firstLine = entryLines[0] || "";
        const secondLine = entryLines[1] || "";

        // Heuristic: if first line is shorter and capitalized, it might be the company
        let company = firstLine.replace(PATTERNS.dateRange, "").replace(PATTERNS.singleDate, "").trim();
        let role = secondLine.replace(PATTERNS.dateRange, "").replace(PATTERNS.singleDate, "").trim();

        // If first line has typical role keywords, swap
        const roleKeywords = /engineer|developer|manager|analyst|designer|intern|lead|director|specialist|coordinator|consultant/i;
        if (roleKeywords.test(firstLine) && !roleKeywords.test(secondLine)) {
            [company, role] = [role, company];
        }

        // Description is the rest
        const description = descriptionLines
            .map(l => l.replace(/^[-•◦▪▸►➤→]\s*/, "").trim())
            .filter(l => l.length > 0)
            .join("\n• ");

        if (company || role) {
            experience.push({
                company: company.replace(/[-–—|]/g, " ").replace(/\s+/g, " ").trim(),
                role: role.replace(/[-–—|]/g, " ").replace(/\s+/g, " ").trim(),
                description: description ? `• ${description}` : "",
                start: dates.start,
                end: dates.end,
            });
        }

        entryLines = [];
        descriptionLines = [];
        currentEntry = {};
    };

    let isReadingDescription = false;

    for (const line of lines) {
        const isBullet = /^[-•◦▪▸►➤→]\s*/.test(line.trim());
        const hasDate = PATTERNS.dateRange.test(line) || PATTERNS.singleDate.test(line);

        // If this looks like a new entry (has date and we already have lines)
        if (hasDate && entryLines.length >= 2 && !isBullet) {
            processEntry();
            isReadingDescription = false;
        }

        if (isBullet || (isReadingDescription && !hasDate)) {
            descriptionLines.push(line);
            isReadingDescription = true;
        } else {
            if (descriptionLines.length > 0 && !isBullet) {
                // This might be a new entry header
                if (entryLines.length >= 2) {
                    processEntry();
                }
            }
            entryLines.push(line);
            isReadingDescription = false;
        }
    }

    // Process remaining
    processEntry();

    return experience;
}

/**
 * Parse projects section content
 */
function parseProjects(content: string): Project[] {
    const projects: Project[] = [];
    const lines = content.split("\n").filter(l => l.trim());

    if (lines.length === 0) return projects;

    let currentProject: Partial<Project> = {};
    let projectLines: string[] = [];
    let descriptionLines: string[] = [];

    const processProject = () => {
        if (projectLines.length === 0) return;

        // First line is typically the project title
        const title = projectLines[0]
            ?.replace(PATTERNS.url, "")
            .replace(/[-–—|]/g, " ")
            .replace(/\s+/g, " ")
            .trim() || "";

        // Find URLs for links
        const allText = [...projectLines, ...descriptionLines].join(" ");
        const urlMatch = allText.match(PATTERNS.url);
        const link = urlMatch ? urlMatch[0] : "";

        // Extract tech stack from description (look for tech keywords)
        const techStack: string[] = [];
        const lowerText = allText.toLowerCase();
        for (const tech of TECH_KEYWORDS) {
            if (lowerText.includes(tech.toLowerCase())) {
                techStack.push(tech);
            }
        }

        // Description
        const description = descriptionLines
            .map(l => l.replace(/^[-•◦▪▸►➤→]\s*/, "").replace(PATTERNS.url, "").trim())
            .filter(l => l.length > 0)
            .join(" ");

        if (title) {
            projects.push({
                title: title.substring(0, 100), // Limit title length
                description: description.substring(0, 500),
                techStack: Array.from(new Set(techStack)).slice(0, 10),
                link: link,
            });
        }

        projectLines = [];
        descriptionLines = [];
        currentProject = {};
    };

    let isReadingDescription = false;

    for (const line of lines) {
        const isBullet = /^[-•◦▪▸►➤→]\s*/.test(line.trim());
        const looksLikeTitle = !isBullet && line.trim().length < 80 && !PATTERNS.url.test(line.trim().substring(0, 10));

        if (isBullet) {
            descriptionLines.push(line);
            isReadingDescription = true;
        } else if (isReadingDescription && looksLikeTitle && projectLines.length >= 1) {
            // New project
            processProject();
            projectLines.push(line);
            isReadingDescription = false;
        } else {
            projectLines.push(line);
        }
    }

    // Process remaining
    processProject();

    return projects;
}

/**
 * Extract skills from skills section or entire document
 */
function extractSkills(content: string, fullText: string): string[] {
    const foundSkills = new Set<string>();

    // Search in both the skills section and full text
    const searchText = (content + " " + fullText).toLowerCase();

    for (const tech of TECH_KEYWORDS) {
        const lowerTech = tech.toLowerCase();

        // Check for exact word boundaries to avoid partial matches
        const wordBoundaryPattern = new RegExp(`\\b${escapeRegex(lowerTech)}\\b`, "i");
        if (wordBoundaryPattern.test(searchText)) {
            foundSkills.add(tech);
        }
    }

    // Also look for comma-separated or bullet-separated lists in skills section
    if (content) {
        const items = content.split(/[,•|\n]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 30);
        for (const item of items) {
            // If it looks like a skill (short, no sentences)
            if (!item.includes(" ") || item.split(" ").length <= 3) {
                // Check if it matches any known tech
                const lowerItem = item.toLowerCase();
                for (const tech of TECH_KEYWORDS) {
                    if (lowerItem === tech.toLowerCase() || lowerItem.includes(tech.toLowerCase())) {
                        foundSkills.add(tech);
                    }
                }
            }
        }
    }

    return Array.from(foundSkills).sort();
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// =============================================================================
// MAIN PARSING FUNCTION
// =============================================================================

/**
 * Parse raw resume text into structured ResumeData using heuristics
 * This is a 100% client-side solution with no API calls
 */
export function parseResumeHeuristic(text: string): ResumeData {
    // Step A: Normalization
    const normalizedText = normalizeText(text);
    const lines = normalizedText.split("\n");
    const lowerText = normalizedText.toLowerCase();

    // Step B: Section Segmentation
    const sections: Record<string, string> = {
        education: "",
        experience: "",
        skills: "",
        projects: "",
    };

    let currentSection: keyof typeof sections | null = null;
    let currentSectionContent: string[] = [];

    const saveCurrentSection = () => {
        if (currentSection && currentSectionContent.length > 0) {
            sections[currentSection] = currentSectionContent.join("\n");
        }
        currentSectionContent = [];
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        // Check if this is a section header
        if (isSectionHeader(line, lowerLine)) {
            const sectionType = identifySectionType(line);
            if (sectionType) {
                // Save previous section
                saveCurrentSection();
                currentSection = sectionType;
                continue;
            }
        }

        // Add to current section content
        if (currentSection) {
            currentSectionContent.push(line);
        }
    }

    // Save the last section
    saveCurrentSection();

    // Step C: Data Extraction
    const personal = extractPersonalInfo(lines, normalizedText);
    const education = parseEducation(sections.education);
    const experience = parseExperience(sections.experience);
    const projects = parseProjects(sections.projects);
    const skills = extractSkills(sections.skills, normalizedText);

    // Step D: Build ResumeData
    const resumeData: ResumeData = {
        personal,
        education,
        experience,
        projects,
        skills,
    };

    return resumeData;
}

// =============================================================================
// VALIDATION HELPER
// =============================================================================

/**
 * Check how well the parsing worked and return confidence score
 */
export function getParsingConfidence(result: ResumeData): {
    score: number;
    details: string[];
} {
    const details: string[] = [];
    let score = 0;

    // Personal info checks
    if (result.personal.fullName) {
        score += 20;
    } else {
        details.push("Could not detect name");
    }

    if (result.personal.email) {
        score += 15;
    } else {
        details.push("No email found");
    }

    if (result.personal.phone) {
        score += 5;
    }

    if (result.personal.github || result.personal.linkedin) {
        score += 5;
    }

    // Section checks
    if (result.education.length > 0) {
        score += 15;
    } else {
        details.push("No education entries parsed");
    }

    if (result.experience.length > 0) {
        score += 20;
    } else {
        details.push("No experience entries parsed");
    }

    if (result.projects.length > 0) {
        score += 10;
    }

    if (result.skills.length >= 3) {
        score += 10;
    } else if (result.skills.length > 0) {
        score += 5;
        details.push("Few skills detected - consider adding more");
    } else {
        details.push("No skills detected");
    }

    return { score: Math.min(score, 100), details };
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { ResumeData };
export { TECH_KEYWORDS };

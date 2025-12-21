// ConsoleCV - ATS Keyword Analysis Logic Engine
// Client-side utility for comparing resume content against job descriptions
// 100% client-side, no API calls required

import type { ResumeData } from "@/types/resume";

// =============================================================================
// STOP WORDS LIST (~80 common English words to filter out)
// =============================================================================

const STOP_WORDS = new Set([
    // Articles & Determiners
    "a", "an", "the", "this", "that", "these", "those",
    // Prepositions
    "in", "on", "at", "to", "for", "of", "with", "by", "from", "up", "about",
    "into", "through", "during", "before", "after", "above", "below", "between",
    "under", "over", "out", "off", "down", "across", "behind", "beyond",
    // Conjunctions
    "and", "or", "but", "nor", "so", "yet", "both", "either", "neither",
    // Pronouns
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
    "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she",
    "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
    "theirs", "themselves", "what", "which", "who", "whom", "whose",
    // Common verbs (be, have, do forms)
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has",
    "had", "having", "do", "does", "did", "doing", "would", "should", "could",
    "ought", "might", "must", "shall", "will", "can", "may",
    // Auxiliary words
    "not", "no", "yes", "all", "any", "some", "each", "every", "such", "more",
    "most", "other", "than", "then", "now", "here", "there", "when", "where",
    "why", "how", "if", "because", "as", "until", "while", "although", "though",
    // Common adjectives/adverbs
    "only", "own", "same", "just", "also", "very", "even", "well", "back",
    "still", "way", "take", "come", "make", "get", "go", "see", "know",
    // Common resume filler words
    "responsible", "responsibilities", "ability", "able", "work", "working",
    "worked", "etc", "including", "included", "include", "using", "used", "use",
    "help", "helped", "helping", "ensure", "ensured", "ensuring", "provide",
    "provided", "providing", "strong", "excellent", "good", "great", "best",
    // Numbers and common terms
    "one", "two", "three", "first", "second", "new", "experience", "experienced",
    "years", "year", "team", "teams", "role", "position", "job", "company",
]);

// Minimum word length to consider
const MIN_WORD_LENGTH = 2;

// High-value technical keywords that should always be kept
const TECH_KEYWORDS = new Set([
    // Programming Languages
    "javascript", "typescript", "python", "java", "cpp", "csharp", "ruby", "go",
    "golang", "rust", "swift", "kotlin", "php", "scala", "perl", "r", "matlab",
    // Frontend
    "react", "reactjs", "angular", "vue", "vuejs", "svelte", "nextjs", "nuxt",
    "html", "css", "sass", "scss", "less", "tailwind", "bootstrap", "jquery",
    // Backend
    "node", "nodejs", "express", "nestjs", "django", "flask", "fastapi", "spring",
    "rails", "laravel", "dotnet", "aspnet",
    // Databases
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch",
    "dynamodb", "cassandra", "oracle", "sqlite", "firebase", "supabase",
    // Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "k8s", "terraform", "ansible",
    "jenkins", "circleci", "github", "gitlab", "bitbucket", "ci", "cd", "cicd",
    // Tools & Platforms
    "git", "linux", "unix", "bash", "shell", "vim", "vscode", "jira", "confluence",
    "slack", "figma", "sketch", "postman", "swagger", "graphql", "rest", "api",
    // Concepts & Methodologies
    "agile", "scrum", "kanban", "tdd", "bdd", "oop", "functional", "microservices",
    "serverless", "saas", "paas", "iaas", "mvp", "poc",
    // Data & AI/ML
    "ml", "ai", "machine", "learning", "deep", "neural", "tensorflow", "pytorch",
    "pandas", "numpy", "scipy", "sklearn", "nlp", "cv", "computer", "vision",
    // Security
    "security", "oauth", "jwt", "ssl", "tls", "encryption", "authentication",
    "authorization", "sso", "ldap",
]);

// =============================================================================
// TYPES
// =============================================================================

export interface ATSAnalysisResult {
    score: number;                    // 0-100 match score
    matchedKeywords: string[];        // Keywords found in both
    missingKeywords: string[];        // Keywords in JD but not in resume
    resumeKeywords: string[];         // All keywords extracted from resume
    jobKeywords: string[];            // All keywords extracted from JD
    suggestions: string[];            // Improvement suggestions
}

export interface KeywordWithWeight {
    word: string;
    weight: number;  // Higher weight = more important
    count: number;   // How many times it appears
}

// =============================================================================
// KEYWORD EXTRACTION
// =============================================================================

/**
 * Extract meaningful keywords from text
 * - Removes stop words
 * - Prioritizes technical terms
 * - Weights by frequency and capitalization
 */
export function extractKeywords(text: string): string[] {
    if (!text || typeof text !== "string") return [];

    // Store original text for capitalization check
    const originalText = text;

    // Clean and tokenize
    const words = text
        .toLowerCase()
        // Remove special characters but keep hyphens for compound words
        .replace(/[^a-z0-9\s\-]/g, " ")
        // Replace multiple spaces with single space
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter((word) => word.length >= MIN_WORD_LENGTH);

    // Count word frequency
    const wordFrequency = new Map<string, number>();
    words.forEach((word) => {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });

    // Check for capitalized words in original (likely proper nouns/skills)
    const capitalizedWords = new Set<string>();
    const capitalizedMatches = originalText.match(/\b[A-Z][a-zA-Z]*\b/g) || [];
    capitalizedMatches.forEach((word) => {
        if (word.length >= MIN_WORD_LENGTH) {
            capitalizedWords.add(word.toLowerCase());
        }
    });

    // Score and filter words
    const scoredWords: KeywordWithWeight[] = [];

    wordFrequency.forEach((count, word) => {
        // Skip stop words (unless they're tech keywords)
        if (STOP_WORDS.has(word) && !TECH_KEYWORDS.has(word)) {
            return;
        }

        // Calculate weight
        let weight = 1;

        // Boost for technical keywords
        if (TECH_KEYWORDS.has(word)) {
            weight += 3;
        }

        // Boost for frequency (cap at 3x)
        weight += Math.min(count - 1, 2);

        // Boost for capitalized words in original
        if (capitalizedWords.has(word)) {
            weight += 1;
        }

        scoredWords.push({ word, weight, count });
    });

    // Sort by weight (descending) and extract unique words
    return scoredWords
        .sort((a, b) => b.weight - a.weight)
        .map((item) => item.word);
}

/**
 * Extract keywords with their weights for detailed analysis
 */
export function extractKeywordsWithWeights(text: string): KeywordWithWeight[] {
    if (!text || typeof text !== "string") return [];

    const originalText = text;

    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter((word) => word.length >= MIN_WORD_LENGTH);

    const wordFrequency = new Map<string, number>();
    words.forEach((word) => {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });

    const capitalizedWords = new Set<string>();
    const capitalizedMatches = originalText.match(/\b[A-Z][a-zA-Z]*\b/g) || [];
    capitalizedMatches.forEach((word) => {
        if (word.length >= MIN_WORD_LENGTH) {
            capitalizedWords.add(word.toLowerCase());
        }
    });

    const scoredWords: KeywordWithWeight[] = [];

    wordFrequency.forEach((count, word) => {
        if (STOP_WORDS.has(word) && !TECH_KEYWORDS.has(word)) {
            return;
        }

        let weight = 1;
        if (TECH_KEYWORDS.has(word)) weight += 3;
        weight += Math.min(count - 1, 2);
        if (capitalizedWords.has(word)) weight += 1;

        scoredWords.push({ word, weight, count });
    });

    return scoredWords.sort((a, b) => b.weight - a.weight);
}

// =============================================================================
// RESUME FLATTENING
// =============================================================================

/**
 * Flatten all resume data into a single searchable string
 */
export function flattenResumeData(resumeData: ResumeData): string {
    const parts: string[] = [];

    // Personal info
    if (resumeData.personal) {
        parts.push(resumeData.personal.fullName || "");
    }

    // Skills (most important for ATS)
    if (resumeData.skills && resumeData.skills.length > 0) {
        parts.push(resumeData.skills.join(" "));
    }

    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
        resumeData.experience.forEach((exp) => {
            parts.push(exp.company || "");
            parts.push(exp.role || "");
            parts.push(exp.description || "");
        });
    }

    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
        resumeData.projects.forEach((project) => {
            parts.push(project.title || "");
            parts.push(project.description || "");
            parts.push((project.techStack || []).join(" "));
        });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
        resumeData.education.forEach((edu) => {
            parts.push(edu.school || "");
            parts.push(edu.degree || "");
        });
    }

    return parts.filter(Boolean).join(" ");
}

// =============================================================================
// MATCH CALCULATION
// =============================================================================

/**
 * Calculate ATS match score from raw resume text and job description
 * This is the universal function that works with any text input
 */
export function calculateMatchFromText(
    resumeText: string,
    jobDescription: string
): ATSAnalysisResult {
    // Extract keywords from both
    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywordsWithWeights = extractKeywordsWithWeights(jobDescription);
    const jobKeywords = jobKeywordsWithWeights.map((k) => k.word);

    // Create set for efficient lookup
    const resumeKeywordSet = new Set(resumeKeywords);

    // Find matches and misses
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    // Check each job keyword against resume
    jobKeywordsWithWeights.forEach(({ word, weight }) => {
        if (resumeKeywordSet.has(word)) {
            matchedKeywords.push(word);
        } else {
            // Only add high-weight missing keywords (important ones)
            if (weight >= 2) {
                missingKeywords.push(word);
            }
        }
    });

    // Calculate weighted score
    let totalWeight = 0;
    let matchedWeight = 0;

    jobKeywordsWithWeights.forEach(({ word, weight }) => {
        totalWeight += weight;
        if (resumeKeywordSet.has(word)) {
            matchedWeight += weight;
        }
    });

    // Calculate percentage score (0-100)
    const score = totalWeight > 0
        ? Math.round((matchedWeight / totalWeight) * 100)
        : 0;

    // Generate suggestions (for external resumes, we pass null for resumeData)
    const suggestions = generateSuggestionsFromText(
        score,
        missingKeywords,
        resumeText
    );

    return {
        score,
        matchedKeywords: matchedKeywords.slice(0, 30), // Limit for UI
        missingKeywords: missingKeywords.slice(0, 20), // Top 20 missing
        resumeKeywords: resumeKeywords.slice(0, 50),
        jobKeywords: jobKeywords.slice(0, 50),
        suggestions,
    };
}

/**
 * Calculate ATS match score between ResumeData and job description
 * This is a convenience wrapper for our internal resume format
 */
export function calculateMatch(
    resumeData: ResumeData,
    jobDescription: string
): ATSAnalysisResult {
    // Flatten resume to single string
    const resumeText = flattenResumeData(resumeData);

    // Use the universal text-based function
    const result = calculateMatchFromText(resumeText, jobDescription);

    // Override suggestions with ResumeData-aware suggestions
    result.suggestions = generateSuggestions(
        result.score,
        result.missingKeywords,
        result.matchedKeywords,
        resumeData
    );

    return result;
}

// =============================================================================
// SUGGESTIONS GENERATOR
// =============================================================================

/**
 * Generate suggestions from raw text (for external PDFs)
 */
function generateSuggestionsFromText(
    score: number,
    missingKeywords: string[],
    resumeText: string
): string[] {
    const suggestions: string[] = [];

    // Score-based suggestions
    if (score < 40) {
        suggestions.push(
            "This resume has low keyword alignment with the job description. Consider tailoring it more closely."
        );
    } else if (score < 70) {
        suggestions.push(
            "Good foundation! The resume covers many requirements but could include more relevant keywords."
        );
    } else {
        suggestions.push(
            "Excellent match! This resume aligns well with the job description."
        );
    }

    // Missing technical skills
    const missingTechKeywords = missingKeywords.filter((word) =>
        TECH_KEYWORDS.has(word)
    );
    if (missingTechKeywords.length > 0) {
        const topMissing = missingTechKeywords.slice(0, 5).join(", ");
        suggestions.push(
            `Consider adding these technical skills if applicable: ${topMissing}`
        );
    }

    // Check resume length
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount < 200) {
        suggestions.push(
            "The resume appears quite short. More detailed descriptions could improve keyword matching."
        );
    }

    // General tip for external resumes
    if (score < 60) {
        suggestions.push(
            "Tip: Use action verbs and quantify achievements to make your resume more impactful."
        );
    }

    return suggestions.slice(0, 4);
}

/**
 * Generate actionable suggestions based on analysis
 */
function generateSuggestions(
    score: number,
    missingKeywords: string[],
    _matchedKeywords: string[],
    resumeData: ResumeData
): string[] {
    const suggestions: string[] = [];

    // Score-based suggestions
    if (score < 40) {
        suggestions.push(
            "Your resume has low keyword alignment. Consider tailoring it more closely to this job description."
        );
    } else if (score < 70) {
        suggestions.push(
            "Good foundation! Adding a few more relevant keywords could improve your match score."
        );
    } else {
        suggestions.push(
            "Excellent match! Your resume aligns well with this job description."
        );
    }

    // Missing technical skills
    const missingTechKeywords = missingKeywords.filter((word) =>
        TECH_KEYWORDS.has(word)
    );
    if (missingTechKeywords.length > 0) {
        const topMissing = missingTechKeywords.slice(0, 5).join(", ");
        suggestions.push(
            `Consider adding these technical skills if you have them: ${topMissing}`
        );
    }

    // Skills section check
    if (!resumeData.skills || resumeData.skills.length < 5) {
        suggestions.push(
            "Your skills section seems light. ATS systems heavily weight the skills section."
        );
    }

    // Experience descriptions check
    const hasShortDescriptions = resumeData.experience?.some(
        (exp) => (exp.description || "").length < 100
    );
    if (hasShortDescriptions) {
        suggestions.push(
            "Some experience entries have short descriptions. Adding more detail with relevant keywords can help."
        );
    }

    // Project descriptions check
    const hasProjects = resumeData.projects && resumeData.projects.length > 0;
    if (!hasProjects) {
        suggestions.push(
            "Adding projects that demonstrate the required skills can significantly improve your match."
        );
    }

    return suggestions.slice(0, 4); // Max 4 suggestions
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get score color class based on score value
 */
export function getScoreColor(score: number): {
    text: string;
    bg: string;
    border: string;
    gradient: string;
} {
    if (score >= 70) {
        return {
            text: "text-emerald-400",
            bg: "bg-emerald-500",
            border: "border-emerald-500",
            gradient: "from-emerald-500 to-green-400",
        };
    } else if (score >= 40) {
        return {
            text: "text-amber-400",
            bg: "bg-amber-500",
            border: "border-amber-500",
            gradient: "from-amber-500 to-yellow-400",
        };
    } else {
        return {
            text: "text-red-400",
            bg: "bg-red-500",
            border: "border-red-500",
            gradient: "from-red-500 to-rose-400",
        };
    }
}

/**
 * Get score label based on score value
 */
export function getScoreLabel(score: number): string {
    if (score >= 80) return "Excellent Match";
    if (score >= 70) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 50) return "Moderate Match";
    if (score >= 40) return "Fair Match";
    if (score >= 30) return "Needs Work";
    return "Low Match";
}

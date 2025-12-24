// ConsoleCV - Enhanced GitHub Import Utility
// Analyzes repository structure to generate "Resume-Quality" descriptions
// Uses deterministic logic - no AI APIs required

import type { GitHubRepo, Project } from "@/types/resume";

// =============================================================================
// TYPES
// =============================================================================

interface RepoLanguages {
    [language: string]: number; // language name -> bytes of code
}

interface PackageJson {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

interface RepoAnalysis {
    primaryLanguage: string | null;
    frameworks: string[];
    infrastructure: string[];
    fallbackDescription: string;
}

// GitHub API error response
export interface GitHubError {
    message: string;
    isRateLimited: boolean;
    requiresAuth: boolean;
}

// Options for GitHub API calls
interface GitHubApiOptions {
    githubPat?: string;
}

// =============================================================================
// FRAMEWORK DETECTION MAPPINGS
// =============================================================================

// JavaScript/TypeScript framework keywords to detect in package.json
const JS_FRAMEWORK_KEYWORDS: Record<string, string> = {
    // Frontend Frameworks
    "react": "React",
    "next": "Next.js",
    "vue": "Vue.js",
    "nuxt": "Nuxt.js",
    "angular": "Angular",
    "svelte": "Svelte",
    "solid-js": "SolidJS",
    "gatsby": "Gatsby",
    "remix": "Remix",
    "astro": "Astro",
    // State Management
    "redux": "Redux",
    "zustand": "Zustand",
    "mobx": "MobX",
    "recoil": "Recoil",
    // Styling
    "tailwindcss": "Tailwind CSS",
    "styled-components": "Styled Components",
    "emotion": "Emotion",
    "sass": "Sass",
    // Backend Frameworks
    "express": "Express.js",
    "fastify": "Fastify",
    "koa": "Koa",
    "hapi": "Hapi",
    "nest": "NestJS",
    "@nestjs/core": "NestJS",
    // Database & ORMs
    "prisma": "Prisma",
    "@prisma/client": "Prisma",
    "mongoose": "MongoDB/Mongoose",
    "typeorm": "TypeORM",
    "sequelize": "Sequelize",
    "drizzle-orm": "Drizzle ORM",
    // Real-time
    "socket.io": "Socket.io",
    "ws": "WebSockets",
    // Testing
    "jest": "Jest",
    "vitest": "Vitest",
    "cypress": "Cypress",
    "playwright": "Playwright",
    // Build Tools
    "vite": "Vite",
    "webpack": "Webpack",
    "esbuild": "esbuild",
    "turbo": "Turborepo",
    // Auth
    "next-auth": "NextAuth.js",
    "@auth/core": "Auth.js",
    "passport": "Passport.js",
    // API
    "graphql": "GraphQL",
    "apollo": "Apollo",
    "@apollo/client": "Apollo Client",
    "trpc": "tRPC",
    "@trpc/server": "tRPC",
};

// Python framework keywords to detect in requirements.txt
const PYTHON_FRAMEWORK_KEYWORDS: Record<string, string> = {
    "flask": "Flask",
    "django": "Django",
    "fastapi": "FastAPI",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scipy": "SciPy",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "tensorflow": "TensorFlow",
    "torch": "PyTorch",
    "pytorch": "PyTorch",
    "keras": "Keras",
    "transformers": "Hugging Face Transformers",
    "langchain": "LangChain",
    "openai": "OpenAI API",
    "streamlit": "Streamlit",
    "gradio": "Gradio",
    "celery": "Celery",
    "sqlalchemy": "SQLAlchemy",
    "alembic": "Alembic",
    "pytest": "Pytest",
    "requests": "Requests",
    "httpx": "HTTPX",
    "aiohttp": "aiohttp",
    "beautifulsoup4": "BeautifulSoup",
    "selenium": "Selenium",
    "playwright": "Playwright",
    "opencv": "OpenCV",
    "pillow": "Pillow",
    "matplotlib": "Matplotlib",
    "plotly": "Plotly",
    "dash": "Dash",
};

// Go module keywords
const GO_FRAMEWORK_KEYWORDS: Record<string, string> = {
    "gin-gonic/gin": "Gin",
    "gofiber/fiber": "Fiber",
    "labstack/echo": "Echo",
    "gorilla/mux": "Gorilla Mux",
    "gorm.io/gorm": "GORM",
};

// Rust crate keywords
const RUST_FRAMEWORK_KEYWORDS: Record<string, string> = {
    "actix-web": "Actix Web",
    "axum": "Axum",
    "rocket": "Rocket",
    "tokio": "Tokio",
    "serde": "Serde",
    "diesel": "Diesel ORM",
};

// =============================================================================
// GITHUB API HELPERS
// =============================================================================

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Creates authorization headers for GitHub API requests
 * Prioritizes user PAT over server-level token
 */
function getAuthHeaders(options?: GitHubApiOptions): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
    };

    // Priority: User PAT > Server token > No auth
    if (options?.githubPat) {
        headers.Authorization = `Bearer ${options.githubPat}`;
    } else if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    return headers;
}

/**
 * Fetches data from GitHub API with proper headers
 * @param endpoint - API endpoint (e.g., /users/octocat/repos)
 * @param options - Optional configuration including githubPat
 */
async function fetchGitHubAPI<T>(
    endpoint: string,
    options?: GitHubApiOptions
): Promise<T | null> {
    try {
        const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
            headers: getAuthHeaders(options),
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            // Log rate limit info for debugging
            if (response.status === 403 || response.status === 429) {
                const remaining = response.headers.get("x-ratelimit-remaining");
                console.warn(
                    `[GitHub API] Rate limit issue on ${endpoint}. Remaining: ${remaining}`
                );
            }
            return null;
        }

        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Fetches raw file content from a GitHub repository
 */
async function fetchRepoFile(
    username: string,
    repoName: string,
    filePath: string
): Promise<string | null> {
    try {
        const response = await fetch(
            `https://raw.githubusercontent.com/${username}/${repoName}/main/${filePath}`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            // Try master branch if main doesn't exist
            const masterResponse = await fetch(
                `https://raw.githubusercontent.com/${username}/${repoName}/master/${filePath}`,
                { next: { revalidate: 3600 } }
            );

            if (!masterResponse.ok) {
                return null;
            }

            return await masterResponse.text();
        }

        return await response.text();
    } catch {
        return null;
    }
}

/**
 * Checks if a file or directory exists in the repository
 */
async function checkFileExists(
    username: string,
    repoName: string,
    filePath: string
): Promise<boolean> {
    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${username}/${repoName}/contents/${filePath}`,
            {
                method: "HEAD",
                headers: {
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );
        return response.ok;
    } catch {
        return false;
    }
}

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Step A: Detect primary language from GitHub Languages API
 */
async function detectLanguages(
    username: string,
    repoName: string
): Promise<string | null> {
    const languages = await fetchGitHubAPI<RepoLanguages>(
        `/repos/${username}/${repoName}/languages`
    );

    if (!languages || Object.keys(languages).length === 0) {
        return null;
    }

    // Find the language with the most bytes
    const primaryLanguage = Object.entries(languages).reduce((a, b) =>
        a[1] > b[1] ? a : b
    )[0];

    return primaryLanguage;
}

/**
 * Step B-1: Detect frameworks from package.json (JavaScript/TypeScript)
 */
async function detectJSFrameworks(
    username: string,
    repoName: string
): Promise<string[]> {
    const packageJsonContent = await fetchRepoFile(
        username,
        repoName,
        "package.json"
    );

    if (!packageJsonContent) {
        return [];
    }

    try {
        const packageJson: PackageJson = JSON.parse(packageJsonContent);
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
        };

        const detectedFrameworks: string[] = [];

        for (const [keyword, frameworkName] of Object.entries(JS_FRAMEWORK_KEYWORDS)) {
            // Check if any dependency contains the keyword
            const hasFramework = Object.keys(allDeps).some(
                (dep) => dep.toLowerCase().includes(keyword.toLowerCase())
            );

            if (hasFramework && !detectedFrameworks.includes(frameworkName)) {
                detectedFrameworks.push(frameworkName);
            }
        }

        // Prioritize and limit frameworks (most important first)
        return prioritizeFrameworks(detectedFrameworks).slice(0, 4);
    } catch {
        return [];
    }
}

/**
 * Step B-2: Detect frameworks from requirements.txt (Python)
 */
async function detectPythonFrameworks(
    username: string,
    repoName: string
): Promise<string[]> {
    const requirementsContent = await fetchRepoFile(
        username,
        repoName,
        "requirements.txt"
    );

    if (!requirementsContent) {
        // Also try pyproject.toml or setup.py
        return [];
    }

    const detectedFrameworks: string[] = [];
    const lines = requirementsContent.toLowerCase().split("\n");

    for (const [keyword, frameworkName] of Object.entries(PYTHON_FRAMEWORK_KEYWORDS)) {
        const hasFramework = lines.some((line) =>
            line.includes(keyword.toLowerCase())
        );

        if (hasFramework && !detectedFrameworks.includes(frameworkName)) {
            detectedFrameworks.push(frameworkName);
        }
    }

    return detectedFrameworks.slice(0, 4);
}

/**
 * Step B-3: Detect frameworks from go.mod (Go)
 */
async function detectGoFrameworks(
    username: string,
    repoName: string
): Promise<string[]> {
    const goModContent = await fetchRepoFile(username, repoName, "go.mod");

    if (!goModContent) {
        return [];
    }

    const detectedFrameworks: string[] = [];

    for (const [keyword, frameworkName] of Object.entries(GO_FRAMEWORK_KEYWORDS)) {
        if (
            goModContent.includes(keyword) &&
            !detectedFrameworks.includes(frameworkName)
        ) {
            detectedFrameworks.push(frameworkName);
        }
    }

    return detectedFrameworks.slice(0, 4);
}

/**
 * Step B-4: Detect frameworks from Cargo.toml (Rust)
 */
async function detectRustFrameworks(
    username: string,
    repoName: string
): Promise<string[]> {
    const cargoContent = await fetchRepoFile(username, repoName, "Cargo.toml");

    if (!cargoContent) {
        return [];
    }

    const detectedFrameworks: string[] = [];

    for (const [keyword, frameworkName] of Object.entries(RUST_FRAMEWORK_KEYWORDS)) {
        if (
            cargoContent.includes(keyword) &&
            !detectedFrameworks.includes(frameworkName)
        ) {
            detectedFrameworks.push(frameworkName);
        }
    }

    return detectedFrameworks.slice(0, 4);
}

/**
 * Step C: Detect infrastructure (Docker, CI/CD)
 */
async function detectInfrastructure(
    username: string,
    repoName: string
): Promise<string[]> {
    const infrastructure: string[] = [];

    // Run checks in parallel
    const [hasDocker, hasDockerCompose, hasGitHubActions, hasVercel, hasNetlify] =
        await Promise.all([
            fetchRepoFile(username, repoName, "Dockerfile").then((f) => !!f),
            fetchRepoFile(username, repoName, "docker-compose.yml").then((f) => !!f),
            checkFileExists(username, repoName, ".github/workflows"),
            fetchRepoFile(username, repoName, "vercel.json").then((f) => !!f),
            fetchRepoFile(username, repoName, "netlify.toml").then((f) => !!f),
        ]);

    if (hasDocker || hasDockerCompose) {
        infrastructure.push("Docker containerization");
    }

    if (hasGitHubActions) {
        infrastructure.push("GitHub Actions CI/CD");
    }

    if (hasVercel) {
        infrastructure.push("Vercel deployment");
    }

    if (hasNetlify) {
        infrastructure.push("Netlify deployment");
    }

    return infrastructure;
}

/**
 * Prioritize frameworks by importance (frontend frameworks first, then backend, etc.)
 */
function prioritizeFrameworks(frameworks: string[]): string[] {
    const priority: Record<string, number> = {
        // Meta-frameworks (highest priority)
        "Next.js": 100,
        "Nuxt.js": 99,
        "Remix": 98,
        "Gatsby": 97,
        "Astro": 96,
        // Frontend frameworks
        "React": 90,
        "Vue.js": 89,
        "Angular": 88,
        "Svelte": 87,
        "SolidJS": 86,
        // Backend frameworks
        "NestJS": 80,
        "Express.js": 79,
        "Fastify": 78,
        "FastAPI": 77,
        "Django": 76,
        "Flask": 75,
        // Database/ORM
        "Prisma": 70,
        "MongoDB/Mongoose": 69,
        "TypeORM": 68,
        // Styling
        "Tailwind CSS": 60,
        // AI/ML
        "TensorFlow": 55,
        "PyTorch": 54,
        "LangChain": 53,
    };

    return frameworks.sort((a, b) => {
        const priorityA = priority[a] || 0;
        const priorityB = priority[b] || 0;
        return priorityB - priorityA;
    });
}

/**
 * Main analysis function - analyzes a single repository
 */
async function analyzeRepo(
    username: string,
    repoName: string,
    fallbackDescription: string
): Promise<RepoAnalysis> {
    try {
        // Run all analyses in parallel for performance
        const [
            primaryLanguage,
            jsFrameworks,
            pythonFrameworks,
            goFrameworks,
            rustFrameworks,
            infrastructure,
        ] = await Promise.all([
            detectLanguages(username, repoName),
            detectJSFrameworks(username, repoName),
            detectPythonFrameworks(username, repoName),
            detectGoFrameworks(username, repoName),
            detectRustFrameworks(username, repoName),
            detectInfrastructure(username, repoName),
        ]);

        // Combine all detected frameworks
        const allFrameworks = [
            ...jsFrameworks,
            ...pythonFrameworks,
            ...goFrameworks,
            ...rustFrameworks,
        ];

        // Deduplicate and prioritize
        const uniqueFrameworks = Array.from(new Set(allFrameworks));
        const prioritizedFrameworks = prioritizeFrameworks(uniqueFrameworks);

        return {
            primaryLanguage,
            frameworks: prioritizedFrameworks,
            infrastructure,
            fallbackDescription,
        };
    } catch {
        // If analysis fails, return minimal data
        return {
            primaryLanguage: null,
            frameworks: [],
            infrastructure: [],
            fallbackDescription,
        };
    }
}

/**
 * Step D: Generate resume-quality description from analysis
 */
function generateDescription(analysis: RepoAnalysis): string {
    const { primaryLanguage, frameworks, infrastructure, fallbackDescription } =
        analysis;

    // If we have no analysis data, use fallback
    if (!primaryLanguage && frameworks.length === 0 && infrastructure.length === 0) {
        return fallbackDescription;
    }

    const parts: string[] = [];

    // Start with language
    if (primaryLanguage) {
        parts.push(`A ${primaryLanguage} application`);
    } else {
        parts.push("An application");
    }

    // Add frameworks
    if (frameworks.length > 0) {
        const frameworkList = frameworks.slice(0, 3).join(", ");
        parts[0] += ` built with ${frameworkList}`;
    }

    // Add infrastructure highlights
    if (infrastructure.length > 0) {
        const infraList = infrastructure.slice(0, 2).join(" and ");
        parts.push(`featuring ${infraList}`);
    }

    // Combine into final description
    let description = parts.join(", ");

    // Ensure it ends with a period
    if (!description.endsWith(".")) {
        description += ".";
    }

    return description;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Fetches the top repositories for a GitHub user
 * Filters out forks and sorts by stars
 * @param username - GitHub username
 * @param limit - Maximum number of repos to fetch (default: 6)
 * @param githubPat - Optional user's GitHub Personal Access Token for authenticated requests
 */
export async function fetchGitHubRepos(
    username: string,
    limit: number = 6,
    githubPat?: string
): Promise<GitHubRepo[]> {
    const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/repos?sort=stars&per_page=100`,
        {
            headers: getAuthHeaders({ githubPat }),
            next: { revalidate: 3600 },
        }
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`GitHub user "${username}" not found`);
        }
        if (response.status === 403 || response.status === 429) {
            const isAuthenticated = !!githubPat || !!process.env.GITHUB_TOKEN;
            const errorMessage = isAuthenticated
                ? "GitHub API rate limit exceeded. Please try again in a few minutes."
                : "GitHub API rate limit exceeded. Add a Personal Access Token in Settings to increase your rate limit.";

            const error = new Error(errorMessage) as Error & { isRateLimited: boolean; requiresAuth: boolean };
            error.isRateLimited = true;
            error.requiresAuth = !isAuthenticated;
            throw error;
        }
        throw new Error(`Failed to fetch GitHub repos: ${response.statusText}`);
    }

    const repos: GitHubRepo[] = await response.json();

    // Filter out forks and limit results
    return repos
        .filter((repo) => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, limit);
}

/**
 * Enhanced function to convert GitHub repos to Projects with AI-quality descriptions
 * Analyzes each repo's file structure to generate meaningful descriptions
 * @param username - GitHub username
 * @param repos - Array of GitHub repositories
 */
async function analyzeAndMapRepos(
    username: string,
    repos: GitHubRepo[]
): Promise<Project[]> {
    // Analyze all repos in parallel with error handling
    const analysisResults = await Promise.allSettled(
        repos.map((repo) =>
            analyzeRepo(
                username,
                repo.name,
                repo.description || `A ${repo.language || "software"} project`
            )
        )
    );

    // Map results to projects
    return repos.map((repo, index) => {
        const result = analysisResults[index];

        // Get analysis or use fallback
        const analysis: RepoAnalysis =
            result.status === "fulfilled"
                ? result.value
                : {
                    primaryLanguage: repo.language,
                    frameworks: [],
                    infrastructure: [],
                    fallbackDescription:
                        repo.description || `A ${repo.language || "software"} project`,
                };

        // Generate the resume-quality description
        const description = generateDescription(analysis);

        // Build tech stack from analysis + repo topics
        const techStack = buildTechStack(analysis, repo);

        return {
            title: formatRepoName(repo.name),
            description,
            techStack,
            link: repo.html_url,
        };
    });
}

/**
 * Builds a comprehensive tech stack from analysis and repo metadata
 */
function buildTechStack(analysis: RepoAnalysis, repo: GitHubRepo): string[] {
    const techStack: string[] = [];

    // Add primary language
    if (analysis.primaryLanguage) {
        techStack.push(analysis.primaryLanguage);
    } else if (repo.language) {
        techStack.push(repo.language);
    }

    // Add top frameworks (limited to avoid clutter)
    techStack.push(...analysis.frameworks.slice(0, 2));

    // Add relevant topics from repo
    const relevantTopics = repo.topics
        .filter(
            (topic) =>
                !techStack.some((t) => t.toLowerCase() === topic.toLowerCase())
        )
        .slice(0, 2);
    techStack.push(...relevantTopics);

    // Remove duplicates and limit
    return Array.from(new Set(techStack)).slice(0, 5);
}

/**
 * Formats repository name to Title Case
 */
function formatRepoName(name: string): string {
    return name
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Legacy function for backward compatibility
 * Maps GitHub repositories to the Project interface format
 * @param repos - Array of GitHub repositories
 */
export function mapReposToProjects(repos: GitHubRepo[]): Project[] {
    return repos.map((repo) => ({
        title: formatRepoName(repo.name),
        description: repo.description || `A ${repo.language || "software"} project`,
        techStack: [
            ...(repo.language ? [repo.language] : []),
            ...repo.topics.slice(0, 3),
        ].filter(Boolean),
        link: repo.html_url,
    }));
}

/**
 * Enhanced GitHub Projects Import
 * Fetches repos and analyzes their structure to generate resume-quality descriptions
 * @param username - GitHub username
 * @param limit - Maximum number of projects to return (default: 6)
 * @param githubPat - Optional user's GitHub Personal Access Token for authenticated requests
 */
export async function importGitHubProjects(
    username: string,
    limit: number = 6,
    githubPat?: string
): Promise<Project[]> {
    // Fetch repositories (with optional auth)
    const repos = await fetchGitHubRepos(username, limit, githubPat);

    if (repos.length === 0) {
        return [];
    }

    try {
        // Use enhanced analysis for rich descriptions
        const projects = await analyzeAndMapRepos(username, repos);
        return projects;
    } catch {
        // Fallback to basic mapping if analysis fails completely
        console.warn(
            "[GitHub Import] Analysis failed, falling back to basic mapping"
        );
        return mapReposToProjects(repos);
    }
}

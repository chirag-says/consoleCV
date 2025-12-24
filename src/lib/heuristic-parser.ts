// ConsoleCV - Heuristic Resume Parser (FIXED)
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
        "academic credentials",
        "scholastic",
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
        "professional background",
        "work",
        "internship",
        "internships",
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
        "technical expertise",
        "tech skills",
        "abilities",
        "capabilities",
        "skillset",
        "skill set",
    ],
    projects: [
        "projects",
        "personal projects",
        "side projects",
        "portfolio",
        "work samples",
        "notable projects",
        "selected projects",
        "academic projects",
        "professional projects",
        "key projects",
    ],
};

// =============================================================================
// TECH KEYWORDS FOR SKILLS EXTRACTION (300+ comprehensive terms)
// =============================================================================

const TECH_KEYWORDS: string[] = [
    // =========================================================================
    // PROGRAMMING LANGUAGES
    // =========================================================================
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "C", "Ruby", "Go",
    "Golang", "Rust", "Swift", "Kotlin", "PHP", "Scala", "Perl", "R", "Matlab",
    "Dart", "Elixir", "Erlang", "Haskell", "Lua", "Julia", "Clojure", "F#",
    "Assembly", "VBA", "Objective-C", "COBOL", "Fortran", "Groovy", "Solidity",
    "Bash", "Shell", "PowerShell", "SQL", "PL/SQL", "T-SQL",

    // =========================================================================
    // FRONTEND FRAMEWORKS & LIBRARIES
    // =========================================================================
    "React", "React.js", "Vue", "Vue.js", "Angular", "AngularJS", "Next.js",
    "Nuxt", "Nuxt.js", "Svelte", "SvelteKit", "Solid.js", "Preact", "Remix",
    "Gatsby", "Astro", "Qwik", "Ember.js", "Backbone.js", "Alpine.js",
    "HTML", "HTML5", "CSS", "CSS3", "SASS", "SCSS", "Less", "Stylus",
    "Tailwind", "Tailwind CSS", "TailwindCSS", "Bootstrap", "Material UI", "MUI",
    "Chakra UI", "Chakra", "Ant Design", "Semantic UI", "Bulma", "Foundation",
    "Styled Components", "Emotion", "CSS Modules", "PostCSS",
    "Three.js", "WebGL", "D3.js", "D3", "Chart.js", "ECharts", "Highcharts",
    "jQuery", "Redux", "Redux Toolkit", "Zustand", "MobX", "Recoil", "Jotai",
    "XState", "React Query", "TanStack Query", "SWR", "Apollo Client",
    "Vite", "Webpack", "Rollup", "Parcel", "esbuild", "Turbopack", "Snowpack",
    "Babel", "ESLint", "Prettier", "Storybook", "Cypress", "Playwright",
    "Jest", "Vitest", "Mocha", "Jasmine", "Testing Library", "Puppeteer",
    "Framer Motion", "GSAP", "Anime.js", "Lottie",

    // =========================================================================
    // BACKEND FRAMEWORKS & RUNTIME
    // =========================================================================
    "Node.js", "Node", "Express", "Express.js", "Fastify", "Koa", "Hapi",
    "NestJS", "Nest.js", "AdonisJS", "Sails.js", "Feathers.js",
    "Django", "Flask", "FastAPI", "Tornado", "Pyramid", "Celery",
    "Ruby on Rails", "Rails", "Sinatra", "Hanami",
    "Spring", "Spring Boot", "Spring MVC", "Hibernate", "Maven", "Gradle",
    "ASP.NET", ".NET", ".NET Core", "Entity Framework", "Blazor",
    "Laravel", "Symfony", "CodeIgniter", "Yii", "CakePHP", "Slim",
    "Gin", "Echo", "Fiber", "Chi", "Buffalo",
    "Phoenix", "Ecto",
    "Actix", "Rocket", "Axum", "Warp",
    "GraphQL", "Apollo Server", "Prisma", "TypeORM", "Sequelize", "Mongoose",
    "Drizzle", "Kysely", "Knex", "MikroORM",

    // =========================================================================
    // DATABASES
    // =========================================================================
    "MongoDB", "PostgreSQL", "Postgres", "MySQL", "MariaDB", "SQLite",
    "Redis", "Memcached", "Elasticsearch", "OpenSearch",
    "Firebase", "Firestore", "Supabase", "PlanetScale", "Neon",
    "DynamoDB", "Cassandra", "CouchDB", "CouchBase", "Neo4j", "ArangoDB",
    "InfluxDB", "TimescaleDB", "ClickHouse", "Snowflake", "BigQuery",
    "Oracle", "SQL Server", "Microsoft SQL Server", "MSSQL", "DB2",
    "Realm", "LevelDB", "RocksDB", "BoltDB", "BadgerDB",
    "Pinecone", "Weaviate", "Milvus", "Chroma", "Qdrant", "FAISS",

    // =========================================================================
    // CLOUD & DEVOPS
    // =========================================================================
    "AWS", "Amazon Web Services", "EC2", "S3", "Lambda", "ECS", "EKS",
    "CloudFront", "Route 53", "RDS", "SQS", "SNS", "API Gateway",
    "Azure", "Microsoft Azure", "Azure Functions", "Azure DevOps",
    "GCP", "Google Cloud", "Google Cloud Platform", "Cloud Run", "Cloud Functions",
    "Compute Engine", "App Engine", "Kubernetes Engine", "GKE",
    "Docker", "Kubernetes", "K8s", "Helm", "Istio", "Linkerd",
    "Terraform", "Pulumi", "CloudFormation", "Ansible", "Chef", "Puppet",
    "Jenkins", "CircleCI", "Travis CI", "GitHub Actions", "GitLab CI",
    "ArgoCD", "Flux", "Spinnaker", "Tekton",
    "Linux", "Ubuntu", "Debian", "CentOS", "RHEL", "Alpine", "Fedora",
    "Nginx", "Apache", "Caddy", "HAProxy", "Traefik", "Envoy",
    "CI/CD", "DevOps", "GitOps", "SRE", "Infrastructure as Code", "IaC",
    "Prometheus", "Grafana", "Datadog", "New Relic", "Splunk", "ELK Stack",
    "Logstash", "Kibana", "Jaeger", "Zipkin", "OpenTelemetry",
    "Vault", "Consul", "Nomad",
    "Vercel", "Netlify", "Heroku", "Render", "Railway", "Fly.io", "DigitalOcean",
    "Cloudflare", "Cloudflare Workers", "Deno Deploy", "Bun",

    // =========================================================================
    // MOBILE DEVELOPMENT
    // =========================================================================
    "React Native", "Flutter", "Expo", "Ionic", "Capacitor", "Cordova",
    "iOS", "Android", "SwiftUI", "UIKit", "Jetpack Compose", "Kotlin Multiplatform",
    "Xamarin", "MAUI", ".NET MAUI", "NativeScript",
    "Xcode", "Android Studio", "Gradle", "CocoaPods", "Swift Package Manager",

    // =========================================================================
    // DATA SCIENCE & MACHINE LEARNING
    // =========================================================================
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "sklearn",
    "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Plotly",
    "Jupyter", "Jupyter Notebook", "JupyterLab", "Google Colab",
    "OpenAI", "GPT", "GPT-4", "ChatGPT", "LangChain", "LlamaIndex",
    "Hugging Face", "Transformers", "BERT", "LLM", "RAG",
    "Computer Vision", "NLP", "Natural Language Processing",
    "Machine Learning", "Deep Learning", "Neural Networks", "CNN", "RNN", "LSTM",
    "Reinforcement Learning", "MLOps", "MLflow", "Kubeflow", "SageMaker",
    "Apache Spark", "Spark", "PySpark", "Hadoop", "Hive", "Pig", "Flink", "Kafka",
    "Airflow", "Apache Airflow", "Dagster", "Prefect", "dbt",
    "Tableau", "Power BI", "PowerBI", "Looker", "Metabase", "Superset",
    "Data Engineering", "ETL", "Data Warehouse", "Data Lake", "Data Pipeline",
    "Statistical Analysis", "A/B Testing", "Feature Engineering",

    // =========================================================================
    // DESIGN & CREATIVE TOOLS
    // =========================================================================
    "Figma", "Sketch", "Adobe XD", "InVision", "Zeplin", "Framer",
    "Photoshop", "Adobe Photoshop", "Illustrator", "Adobe Illustrator",
    "After Effects", "Premiere Pro", "Final Cut Pro",
    "Blender", "Maya", "Cinema 4D", "ZBrush", "Unity", "Unreal Engine",
    "UI/UX", "UI Design", "UX Design", "User Research", "Wireframing",
    "Prototyping", "Design Systems", "Accessibility", "WCAG", "a11y",
    "Responsive Design", "Mobile-First", "Motion Design",
    "Canva", "Notion", "Miro", "Whimsical", "Lucidchart",

    // =========================================================================
    // API & COMMUNICATION
    // =========================================================================
    "REST", "RESTful", "REST API", "GraphQL", "gRPC", "SOAP",
    "WebSocket", "WebSockets", "Socket.io", "Server-Sent Events", "SSE",
    "OAuth", "OAuth2", "JWT", "JSON Web Token", "SAML", "OpenID Connect", "OIDC",
    "API Gateway", "Swagger", "OpenAPI", "Postman", "Insomnia",
    "RabbitMQ", "Apache Kafka", "NATS", "ZeroMQ", "ActiveMQ", "MQTT",
    "Webhooks", "Microservices", "Service Mesh", "Event-Driven",

    // =========================================================================
    // VERSION CONTROL & COLLABORATION
    // =========================================================================
    "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Mercurial",
    "Jira", "Confluence", "Trello", "Asana", "Linear", "Monday.com",
    "Slack", "Microsoft Teams", "Discord", "Zoom",
    "VS Code", "Visual Studio Code", "Visual Studio", "IntelliJ", "WebStorm",
    "PyCharm", "Eclipse", "Vim", "Neovim", "Emacs", "Sublime Text", "Atom",

    // =========================================================================
    // TESTING
    // =========================================================================
    "Unit Testing", "Integration Testing", "E2E Testing", "End-to-End Testing",
    "TDD", "Test-Driven Development", "BDD", "Behavior-Driven Development",
    "Selenium", "WebDriver", "Appium", "Detox", "Espresso", "XCTest",
    "JUnit", "TestNG", "pytest", "RSpec", "PHPUnit", "NUnit", "xUnit",
    "Coverage", "Code Coverage", "Load Testing", "Performance Testing",
    "k6", "Locust", "JMeter", "Gatling", "Artillery",

    // =========================================================================
    // SECURITY & COMPLIANCE
    // =========================================================================
    "Cybersecurity", "Security", "InfoSec", "Application Security", "AppSec",
    "Penetration Testing", "Pen Testing", "Vulnerability Assessment",
    "OWASP", "SAST", "DAST", "SCA", "DevSecOps",
    "SOC 2", "GDPR", "HIPAA", "PCI DSS", "ISO 27001", "Compliance",
    "Encryption", "SSL/TLS", "TLS", "SSL", "PKI", "Cryptography",
    "IAM", "RBAC", "Zero Trust", "WAF", "Firewall", "VPN",
    "Burp Suite", "Nmap", "Wireshark", "Metasploit", "Kali Linux",

    // =========================================================================
    // SOFT SKILLS & METHODOLOGIES
    // =========================================================================
    "Agile", "Scrum", "Kanban", "Lean", "XP", "Extreme Programming",
    "SAFe", "Waterfall", "Sprint Planning", "Retrospective",
    "Project Management", "Product Management", "Program Management",
    "Leadership", "Team Lead", "Tech Lead", "Mentoring", "Coaching",
    "Communication", "Presentation", "Public Speaking", "Technical Writing",
    "Problem Solving", "Critical Thinking", "Analytical Skills",
    "Collaboration", "Cross-Functional", "Stakeholder Management",
    "Time Management", "Prioritization", "Decision Making",
    "Remote Work", "Distributed Teams", "Async Communication",

    // =========================================================================
    // BLOCKCHAIN & WEB3
    // =========================================================================
    "Blockchain", "Ethereum", "Bitcoin", "Smart Contracts", "Solidity",
    "Web3", "Web3.js", "Ethers.js", "Hardhat", "Truffle", "Foundry",
    "DeFi", "NFT", "DAO", "Tokenomics", "Metamask", "Wallet Connect",
    "IPFS", "Polygon", "Solana", "Avalanche", "Cosmos", "Polkadot",

    // =========================================================================
    // OTHER TOOLS & CONCEPTS
    // =========================================================================
    "CMS", "WordPress", "Drupal", "Strapi", "Contentful", "Sanity", "Ghost",
    "Headless CMS", "JAMstack", "Static Site Generator", "SSG", "SSR",
    "PWA", "Progressive Web App", "Service Worker", "Web Vitals", "SEO",
    "Internationalization", "i18n", "Localization", "l10n",
    "Low-Code", "No-Code", "Automation", "RPA", "Zapier", "n8n", "Make",
    "Twilio", "SendGrid", "Stripe", "PayPal", "Shopify", "Magento",
    "Auth0", "Okta", "Clerk", "Firebase Auth", "Supabase Auth",
    "Socket", "TCP/IP", "HTTP", "HTTPS", "DNS", "CDN",
    "Caching", "Performance Optimization", "Lazy Loading", "Code Splitting",
];

// =============================================================================
// REGEX PATTERNS (FIXED)
// =============================================================================

const PATTERNS = {
    // Email: standard email format
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,

    // Phone: various international formats
    phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}(?:[-.\s]?\d{1,4})?/,

    // GitHub URL - ONLY match actual github.com URLs to avoid false positives
    // FIX: Removed double escaping (\\s -> \s)
    github: /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,38})(?:\/|\s|$)/i,

    // GitHub username pattern - only if explicitly labeled
    githubAlt: /github\.com\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,38})/i,

    // LinkedIn URL - multiple patterns
    linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/i,

    // LinkedIn alternate pattern
    linkedinAlt: /linkedin[:\s\/]+(?:in\/)?([a-zA-Z0-9_-]+)/i,

    // Generic URL
    url: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/i,

    // FIXED: Date patterns (various formats) - improved to catch "Month Year – Month Year"
    // Captures: "Jan 2020 - Feb 2021" or "2020 to Present"
    dateRange: /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:\d{4}|\d{1,2}\/\d{2,4})\s*[-–—]|to\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:(?:\d{4}|\d{1,2}\/\d{2,4})|Present|Current|Now|Ongoing)/i,

    // FIXED: Single date pattern
    singleDate: /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(20\d{2}|19\d{2})\b/i,

    // Degree patterns
    degree: /(?:bachelor['']?s?|master['']?s?|ph\.?d\.?|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?tech\.?|m\.?tech\.?|b\.?e\.?|m\.?e\.?|associate['']?s?|diploma|certificate)(?:\s+(?:of|in)\s+[\w\s]+)?/gi,
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
 * FIXED: Added markdown header support
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

    // FIX #2: Check for markdown headers (## Section Name)
    if (/^#{1,6}\s+.+$/.test(trimmed)) {
        const contentAfterHash = trimmed.replace(/^#+\s+/, "");
        const lowerContent = contentAfterHash.toLowerCase();

        // Check if the markdown header contains section keywords
        for (const headers of Object.values(SECTION_HEADERS)) {
            for (const header of headers) {
                if (lowerContent.includes(header)) {
                    return true;
                }
            }
        }

        // Also check for uppercase markdown headers
        if (/^[A-Z\s&]+$/.test(contentAfterHash) && contentAfterHash.length <= 40) {
            return true;
        }
    }

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

    // Try to find individual dates (Create global regex locally)
    const globalSingleDate = new RegExp(PATTERNS.singleDate, "gi");
    const dateMatches = text.match(globalSingleDate);

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
 * Uses multiple fallback strategies for robust extraction
 */
function extractPersonalInfo(lines: string[], fullText: string): PersonalInfo {
    const personal: PersonalInfo = {
        fullName: "",
        email: "",
        github: "",
        linkedin: "",
        phone: "",
    };

    // =========================================================================
    // EMAIL EXTRACTION
    // =========================================================================
    const emailMatch = fullText.match(PATTERNS.email);
    if (emailMatch) {
        personal.email = emailMatch[0].toLowerCase();
    }

    // =========================================================================
    // PHONE EXTRACTION (search in header area)
    // =========================================================================
    const headerArea = lines.slice(0, 20).join(" ");
    const phoneMatch = headerArea.match(PATTERNS.phone);
    if (phoneMatch) {
        personal.phone = phoneMatch[0].replace(/\s+/g, " ").trim();
    }

    // =========================================================================
    // GITHUB EXTRACTION (try multiple patterns)
    // =========================================================================
    // Try full URL pattern first
    const githubMatch = fullText.match(PATTERNS.github);
    if (githubMatch && githubMatch[1]) {
        personal.github = githubMatch[1];
    } else {
        // Try alternate pattern (github: username or github.com/username without https)
        const githubAltMatch = fullText.match(PATTERNS.githubAlt);
        if (githubAltMatch && githubAltMatch[1]) {
            // Filter out common false positives
            const username = githubAltMatch[1].toLowerCase();
            if (!["com", "io", "org", "actions"].includes(username)) {
                personal.github = githubAltMatch[1];
            }
        }
    }

    // =========================================================================
    // LINKEDIN EXTRACTION (try multiple patterns)
    // =========================================================================
    const linkedinMatch = fullText.match(PATTERNS.linkedin);
    if (linkedinMatch && linkedinMatch[1]) {
        personal.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
    } else {
        // Try alternate pattern
        const linkedinAltMatch = fullText.match(PATTERNS.linkedinAlt);
        if (linkedinAltMatch && linkedinAltMatch[1]) {
            personal.linkedin = `linkedin.com/in/${linkedinAltMatch[1]}`;
        }
    }

    // =========================================================================
    // NAME EXTRACTION (multiple strategies)
    // =========================================================================

    // Strategy 1: Look for a name-like line at the very beginning
    const nameFromLines = extractNameFromLines(lines);
    if (nameFromLines) {
        personal.fullName = nameFromLines;
    }

    // Strategy 2: If no name found, try to extract from email
    if (!personal.fullName && personal.email) {
        const nameFromEmail = extractNameFromEmail(personal.email);
        if (nameFromEmail) {
            personal.fullName = nameFromEmail;
        }
    }

    // Strategy 3: Look for "Name:" or "Full Name:" patterns in header
    if (!personal.fullName) {
        const namePattern = /(?:name|full\s*name)\s*[:\-]\s*([A-Za-z][A-Za-z\s]+)/i;
        const namePatternMatch = headerArea.match(namePattern);
        if (namePatternMatch && namePatternMatch[1]) {
            personal.fullName = formatName(namePatternMatch[1].trim());
        }
    }

    return personal;
}

/**
 * Extract name from the first few lines of text
 * FIX #1: Check line 0 first for single capitalized word
 */
function extractNameFromLines(lines: string[]): string {
    // FIX #1 PRIORITY: Check line 0 first - single word uppercase is likely the name
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        if (firstLine && firstLine.length >= 2 && firstLine.length <= 20) {
            const words = firstLine.split(/\s+/).filter(w => w.length > 0);

            // Single word: "CHIRAG" or "Chirag" format
            if (words.length === 1) {
                const word = words[0];
                // All caps (CHIRAG) or Title case (Chirag) or Mixed (McDonald)
                if (/^[A-Z][a-zA-Z]*$/.test(word) && word.length >= 2) {
                    return formatName(word);
                }
            }

            // Two words: "Chirag Baldia"
            if (words.length === 2) {
                const isNameLike = words.every(w => /^[A-Z][a-zA-Z]*$/.test(w));
                if (isNameLike) {
                    return formatName(firstLine);
                }
            }
        }
    }

    // Look in first 10 lines for a name-like line
    for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line || line.length < 2) continue;

        // Skip lines that look like contact info
        if (PATTERNS.email.test(line)) continue;
        if (PATTERNS.url.test(line)) continue;
        if (/^\+?\d[\d\s\-().]+$/.test(line)) continue; // Phone-like
        if (/^[\d\s]+$/.test(line)) continue; // Just numbers

        // Skip very long lines (likely paragraphs)
        if (line.length > 60) continue;

        // Skip lines that look like section headers
        const lowerLine = line.toLowerCase();
        const isHeader = Object.values(SECTION_HEADERS).some(headers =>
            headers.some(h => lowerLine === h || lowerLine.startsWith(h + " ") || lowerLine.startsWith(h + ":"))
        );
        if (isHeader) continue;

        // Skip lines with common resume keywords
        if (/resume|curriculum|vitae|cv|summary|objective|profile/i.test(line)) continue;

        // If line has pipe delimiters, it might be contact info - try to extract the name part
        if (line.includes("|")) {
            const parts = line.split("|").map(p => p.trim());
            // Take the first substantial part that looks like a name
            for (const part of parts) {
                if (part.length >= 2 && part.length <= 30) {
                    // Check if it looks like a name (not an email, phone, or URL)
                    if (!PATTERNS.email.test(part) && !PATTERNS.url.test(part) && !/\d{5,}/.test(part)) {
                        const words = part.split(/\s+/).filter(w => w.length > 0);
                        if (words.length >= 1 && words.length <= 4) {
                            const validNameWords = words.filter(w =>
                                /^[A-Z][a-z]*\.?$/.test(w) || // Proper case
                                /^[A-Z]+$/.test(w) || // All caps
                                /^[A-Z][a-zA-Z]+$/.test(w) // Mixed case
                            );
                            if (validNameWords.length >= Math.ceil(words.length * 0.5)) {
                                return formatName(part);
                            }
                        }
                    }
                }
            }
            continue; // Already processed, skip to next line
        }

        // Skip lines with bullets
        if (/[•◦▪▸►➤→]/.test(line)) continue;

        // Skip lines with too many special characters (likely not a name)
        if ((line.match(/[,;:]/g) || []).length >= 3) continue;

        // Check if it looks like a name
        const words = line.split(/\s+/).filter(w => w.length > 0);

        // Names are typically 1-4 words
        if (words.length >= 1 && words.length <= 4) {
            // Check if words look "name-like" (start with capital or all caps)
            const validNameWords = words.filter(w =>
                /^[A-Z][a-z]*\.?$/.test(w) || // Proper case (John, J.)
                /^[A-Z]+$/.test(w) || // All caps (JOHN)
                /^[A-Z][a-zA-Z]+$/.test(w) // Mixed case (McDonald)
            );

            // If most words look like name words, accept it
            if (validNameWords.length >= Math.ceil(words.length * 0.5)) {
                return formatName(line);
            }

            // Special case: single ALL CAPS word at the beginning is likely a name
            if (words.length === 1 && /^[A-Z]{2,}$/.test(words[0]) && words[0].length >= 3) {
                return formatName(words[0]);
            }
        }
    }

    return "";
}

/**
 * Extract a name from an email address
 * FIX #7: Better validation
 */
function extractNameFromEmail(email: string): string {
    const localPart = email.split("@")[0];
    if (!localPart) return "";

    // Remove numbers
    const nameStr = localPart.replace(/\d+/g, "");

    // Skip if it's a common username pattern or too short
    if (/^(admin|info|contact|hello|support|noreply|mail|email)/i.test(nameStr)) {
        return "";
    }

    // If nameStr is empty after removing numbers, it's not useful
    if (!nameStr || nameStr.length < 2) {
        return "";
    }

    // Split by common separators (., _, -)
    const parts = nameStr.split(/[._\-]+/).filter(p => p.length > 0);

    if (parts.length >= 1) {
        return parts
            .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
            .join(" ");
    }

    return "";
}

/**
 * Format a name string with proper capitalization
 */
function formatName(name: string): string {
    return name
        .split(/\s+/)
        .filter(w => w.length > 0)
        .map(w => {
            // Handle special cases like "McDonald", "O'Brien"
            if (/^[A-Z][a-z]+[A-Z]/.test(w)) return w; // Already mixed case
            if (w.includes("'")) {
                return w.split("'").map(p =>
                    p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                ).join("'");
            }
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(" ")
        .trim();
}

/**
 * Parse education section content
 */
function parseEducation(content: string): Education[] {
    const education: Education[] = [];
    const lines = content.split("\n").filter(l => l.trim());

    if (lines.length === 0) return education;

    let entryLines: string[] = [];

    const processEntry = () => {
        if (entryLines.length === 0) return;

        const combined = entryLines.join(" ");
        const dates = extractDates(combined);

        // Find degree
        const degreeMatch = combined.match(PATTERNS.degree);
        let degree = degreeMatch ? degreeMatch[0] : "";

        // Sometimes the degree is the first line if no keyword match
        if (!degree && entryLines.length > 0) {
            const firstLine = entryLines[0].toLowerCase();
            if (firstLine.includes("b.") || firstLine.includes("m.") || firstLine.includes("bachelor") || firstLine.includes("master")) {
                degree = entryLines[0];
            }
        }

        // School - try to find the line that looks like a school
        let school = "";
        // Look for keywords like "University", "College", "Institute", "School"
        const schoolKeywords = /university|college|institute|school|academy|polytechnic/i;

        for (const line of entryLines) {
            if (schoolKeywords.test(line)) {
                school = line.replace(PATTERNS.dateRange, "").replace(PATTERNS.singleDate, "").replace(/[-–—]/g, "").trim();
                break;
            }
        }

        // Fallback: use first line if it's not the degree
        if (!school && entryLines.length > 0) {
            const potentialSchool = entryLines[0].replace(PATTERNS.dateRange, "").replace(PATTERNS.singleDate, "").trim();
            if (potentialSchool !== degree) {
                school = potentialSchool;
            } else if (entryLines.length > 1) {
                school = entryLines[1].replace(PATTERNS.dateRange, "").replace(PATTERNS.singleDate, "").trim();
            }
        }

        if (school || degree) {
            education.push({
                school: school.replace(/[-–—,|]/g, " ").replace(/\s+/g, " ").trim(),
                degree: degree.replace(/[-–—,|]/g, " ").replace(/\s+/g, " ").trim(),
                start: dates.start,
                end: dates.end,
            });
        }

        entryLines = [];
    };

    for (const line of lines) {
        // New entry heuristic: line has a date OR contains a school keyword
        // But only if we already have some lines collected (otherwise it's the start of first entry)
        const hasDate = PATTERNS.dateRange.test(line) || PATTERNS.singleDate.test(line);
        const hasSchoolKeyword = /university|college|institute|school|academy/i.test(line);

        if (entryLines.length > 0 && (hasDate || hasSchoolKeyword) && entryLines.length >= 2) {
            processEntry();
        }

        // Also split if we see a clear degree line and we already have a degree for current entry
        if (entryLines.length > 2 && PATTERNS.degree.test(line)) {
            const currentCombined = entryLines.join(" ");
            if (PATTERNS.degree.test(currentCombined)) {
                processEntry();
            }
        }

        entryLines.push(line);
    }

    processEntry();
    return education;
}

/**
 * Parse experience section content
 * FIX #4: Look at more lines for dates
 */
function parseExperience(content: string): Experience[] {
    const experience: Experience[] = [];
    const lines = content.split("\n").filter(l => l.trim());

    if (lines.length === 0) return experience;

    let entryLines: string[] = [];
    let descriptionLines: string[] = [];

    const processEntry = () => {
        if (entryLines.length === 0) return;

        // FIX #4: Extract dates from ALL entry lines, not just first 2
        const headerArea = entryLines.slice(0, 3).join(" ");
        const dates = extractDates(headerArea);

        // Identify Company vs Role
        // Heuristic: Company usually comes first, or is capitalized. Role contains keywords.
        let company = "";
        let role = "";

        // FIX #6: Improved role keywords
        const roleKeywords = /engineer|developer|manager|analyst|designer|intern|lead|director|specialist|coordinator|consultant|associate|head|vp|president|officer|architect|senior|junior/i;

        const line1 = entryLines[0];
        const line2 = entryLines[1] || "";

        // Clean dates from lines
        const cleanLine1 = line1.replace(PATTERNS.dateRange, "").replace(PATTERNS.singleDate, "").trim();
        const cleanLine2 = line2.replace(PATTERNS.dateRange, "").replace(PATTERNS.singleDate, "").trim();

        if (roleKeywords.test(cleanLine1)) {
            role = cleanLine1;
            company = cleanLine2;
        } else if (roleKeywords.test(cleanLine2)) {
            company = cleanLine1;
            role = cleanLine2;
        } else {
            // Fallback: Assume Line 1 is Company, Line 2 is Role
            company = cleanLine1;
            role = cleanLine2;
        }

        // Description processing
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
    };

    for (const line of lines) {
        const isBullet = /^[-•◦▪▸►➤→]\s*/.test(line.trim());
        // Date often signals start of new entry
        const hasDate = PATTERNS.dateRange.test(line) || PATTERNS.singleDate.test(line);

        // If we hit a date and have content, it's likely a new entry
        if (!isBullet && hasDate && (entryLines.length > 0 || descriptionLines.length > 0)) {
            processEntry();
        }

        // If we hit a line that looks like a role/company (short, capitalized) after description, it's a new entry
        if (!isBullet && descriptionLines.length > 0 && line.length < 50 && /[A-Z]/.test(line.charAt(0))) {
            processEntry();
        }

        if (isBullet) {
            descriptionLines.push(line);
        } else {
            // If it's a very long line without bullet, treat as description
            if (line.length > 80) {
                descriptionLines.push(line);
            } else {
                entryLines.push(line);
            }
        }
    }

    processEntry();
    return experience;
}

/**
 * Parse projects section content
 * FIX #3: Skip lines that are just "Link", "Live Link", "GitHub Link"
 */
function parseProjects(content: string): Project[] {
    const projects: Project[] = [];
    const lines = content.split("\n").filter(l => l.trim());

    if (lines.length === 0) return projects;

    let entryLines: string[] = [];
    let descriptionLines: string[] = [];

    const processProject = () => {
        if (entryLines.length === 0) return;

        const nameLine = entryLines[0];
        // Remove links/dates from name
        const title = nameLine
            .replace(PATTERNS.url, "")
            .replace(PATTERNS.dateRange, "")
            .replace(/\|\s*Link\s*$/i, "")
            .replace(/\|\s*Live Link\s*$/i, "")
            .replace(/\|\s*GitHub Link\s*$/i, "")
            .trim();

        // Extract link if present in first line
        let link = "";
        const urlMatch = nameLine.match(PATTERNS.url);
        if (urlMatch) {
            link = urlMatch[0];
        }

        // Description
        const description = descriptionLines
            .map(l => l.replace(/^[-•◦▪▸►➤→]\s*/, "").trim())
            .filter(l => l.length > 0)
            .join("\n• ");

        // Technologies (scan description for keywords)
        // We will leave this empty as technologies are hard to map reliably per project without complex NLP
        // But the global skills extractor catches them all anyway
        const techStack: string[] = [];

        if (title) {
            projects.push({
                title: title.replace(/[-–—|]/g, " ").replace(/\s+/g, " ").trim(),
                description: description ? `• ${description}` : "",
                link: link,
                techStack: techStack,
            });
        }

        entryLines = [];
        descriptionLines = [];
    };

    for (const line of lines) {
        const isBullet = /^[-•◦▪▸►➤→]/.test(line.trim());
        const trimmedLine = line.trim().toLowerCase();

        // FIX #3: Skip lines that are just "Link", "Live Link", "GitHub Link", etc.
        if (!isBullet && /^(?:live\s+)?(?:github\s+)?link\s*$/.test(trimmedLine)) {
            continue; // Skip this line entirely
        }

        // Project names are usually short, bold (we can't see bold), title case lines
        // If we have description lines and hit a short line, it's likely a new project
        if (!isBullet && descriptionLines.length > 0 && line.length < 60 && !PATTERNS.url.test(line.substring(0, 10))) {
            processProject();
        }

        if (isBullet) {
            descriptionLines.push(line);
        } else {
            // If looks like a project title (shortish, capitalized)
            if (line.length < 80) {
                entryLines.push(line);
            } else {
                descriptionLines.push(line);
            }
        }
    }

    processProject();
    return projects;
}

// =============================================================================
// STOP WORDS (exclude from skill extraction)
// =============================================================================

const SKILL_STOP_WORDS = new Set([
    // Common articles and prepositions
    "a", "an", "the", "and", "or", "but", "with", "without", "for", "to", "from",
    "in", "on", "at", "by", "of", "as", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "dare", "ought",
    // Common resume filler words
    "including", "such", "like", "etc", "also", "other", "others", "more", "less",
    "very", "highly", "extensive", "strong", "excellent", "proficient", "experienced",
    "skilled", "knowledge", "understanding", "familiarity", "exposure", "experience",
    // Section headers that might slip through
    "skills", "technical", "technologies", "tools", "languages", "frameworks",
    "software", "hardware", "platforms", "systems", "applications", "programming",
    // Time-related words
    "years", "year", "months", "month", "weeks", "week", "days", "day",
    // Generic descriptors
    "using", "used", "use", "various", "multiple", "several", "many", "all",
    "new", "latest", "modern", "current", "related", "based", "level",
]);

/**
 * Check if a string looks like a valid skill candidate
 */
function isValidSkillCandidate(text: string): boolean {
    const trimmed = text.trim();

    // Too short or too long
    if (trimmed.length < 2 || trimmed.length > 40) return false;

    // More than 4 words is likely a phrase, not a skill
    const words = trimmed.split(/\s+/);
    if (words.length > 4) return false;

    // All lowercase single word that's a stop word
    if (words.length === 1 && SKILL_STOP_WORDS.has(trimmed.toLowerCase())) return false;

    // Check each word against stop words for multi-word skills
    if (words.length > 1) {
        const nonStopWords = words.filter(w => !SKILL_STOP_WORDS.has(w.toLowerCase()));
        if (nonStopWords.length === 0) return false;
    }

    // Contains only numbers
    if (/^\d+$/.test(trimmed)) return false;

    // Starts with common punctuation (leftover from parsing)
    // Starts with common punctuation (leftover from parsing)
    if (/^[,;:\-•◦▪▸►➤→]/.test(trimmed)) return false;

    return true;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extract skills from the full resume text
 */
function extractSkills(content: string, fullText: string): string[] {
    const skillsSet = new Set<string>();

    // Phase 1: Match against known tech keywords in full text
    const searchText = fullText.toLowerCase();

    for (const tech of TECH_KEYWORDS) {
        // Use word boundary for exact matches to avoid partial matches
        const pattern = new RegExp(`\\b${escapeRegex(tech.toLowerCase())}\\b`, "i");
        if (pattern.test(searchText)) {
            skillsSet.add(tech);
        }
    }

    // Phase 2: Parse skills section explicitly
    if (content && content.trim()) {
        const items = content
            .split(/[,|;•◦▪▸►\n]+/)
            .map(s => s.trim())
            .filter(s => s && s.length < 50);

        for (const item of items) {
            const cleanItem = item
                .replace(/^[-*:()[\]{}]/g, "")
                .replace(/[)[\]{}]$/g, "")
                .trim();

            if (cleanItem.length < 3 || !isValidSkillCandidate(cleanItem)) continue;

            // Check if it matches a known keyword
            let found = false;
            for (const tech of TECH_KEYWORDS) {
                if (cleanItem.toLowerCase() === tech.toLowerCase()) {
                    skillsSet.add(tech);
                    found = true;
                    break;
                }
            }

            // Add unknown skills too (contextual trust)
            if (!found && /^[A-Z][a-zA-Z0-9.#+-]*$/.test(cleanItem) && isValidSkillCandidate(cleanItem)) {
                skillsSet.add(cleanItem);
            }
        }
    }

    return Array.from(skillsSet).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
    );
}

/**
 * Split resume text into sections
 */
function extractSections(lines: string[]): Record<string, string> {
    const sections: Record<string, string> = {
        summary: "",
        education: "",
        experience: "",
        skills: "",
        projects: "",
        other: "",
    };

    let currentSection = "other";
    let currentContent: string[] = [];

    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        // Check if this is a section header
        if (isSectionHeader(line, lowerLine)) {
            // Identify which section
            const sectionType = identifySectionType(line);

            // Save current section content
            if (currentSection) {
                sections[currentSection] = currentContent.join("\n").trim();
            }

            // Start new section
            if (sectionType) {
                currentSection = sectionType;
            } else {
                currentSection = "other";
            }

            currentContent = [];
        } else {
            // Add to current section
            currentContent.push(line);
        }
    }

    // Save final section
    if (currentSection) {
        sections[currentSection] = currentContent.join("\n").trim();
    }

    return sections;
}

// =============================================================================
// MAIN PARSER FUNCTION
// =============================================================================

/**
 * Main function to parse resume
 */
export function parseResumeHeuristic(text: string): ResumeData {
    const normalizedText = normalizeText(text);
    const lines = normalizedText.split("\n");
    const sections = extractSections(lines);

    // Extract all components
    const personal = extractPersonalInfo(lines, normalizedText);
    const education = parseEducation(sections.education);
    const experience = parseExperience(sections.experience);
    const projects = parseProjects(sections.projects);
    const skills = extractSkills(sections.skills, normalizedText);

    return {
        personal,
        education,
        experience,
        projects,
        skills,
    };
}

/**
 * Scoring function to validate parsing confidence
 */
export function getParsingConfidence(result: ResumeData): {
    score: number;
    details: string[];
} {
    const details: string[] = [];
    let score = 0;

    if (result.personal.fullName) {
        score += 20;
    } else {
        details.push("❌ Name not detected");
    }

    if (result.personal.email) {
        score += 15;
    } else {
        details.push("❌ Email not found");
    }

    if (result.personal.phone) score += 5;
    if (result.personal.github || result.personal.linkedin) score += 5;

    if (result.education.length > 0) {
        score += 15;
    } else {
        details.push("⚠️ No education entries found");
    }

    if (result.experience.length > 0) {
        score += 20;
    } else {
        details.push("⚠️ No experience entries found");
    }

    if (result.projects.length > 0) score += 10;

    if (result.skills.length >= 10) {
        score += 10;
    } else if (result.skills.length > 0) {
        score += 5;
    } else {
        details.push("⚠️ Few skills detected");
    }

    return { score: Math.min(score, 100), details };
}

export type { ResumeData };
export { TECH_KEYWORDS };
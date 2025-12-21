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
    if (/^[,;:\-•◦▪▸►➤→]/.test(trimmed)) return false;

    return true;
}

/**
 * Normalize skill name for comparison (lowercase, trimmed)
 */
function normalizeSkillName(skill: string): string {
    return skill.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Extract skills from skills section and entire document
 * Uses both dictionary matching AND contextual trust for skills section items
 */
function extractSkills(content: string, fullText: string): string[] {
    // Map to store skills: normalized name -> original capitalization
    const skillsMap = new Map<string, string>();

    // Helper to add a skill with proper capitalization
    const addSkill = (skill: string, preferredCaps: string) => {
        const normalized = normalizeSkillName(skill);
        if (normalized && !skillsMap.has(normalized)) {
            skillsMap.set(normalized, preferredCaps.trim());
        }
    };

    // =========================================================================
    // PHASE 1: Global Dictionary Scan (search entire document for known keywords)
    // =========================================================================
    const searchText = fullText.toLowerCase();

    for (const tech of TECH_KEYWORDS) {
        const lowerTech = tech.toLowerCase();

        // Check for exact word boundaries to avoid partial matches
        const wordBoundaryPattern = new RegExp(`\\b${escapeRegex(lowerTech)}\\b`, "i");
        if (wordBoundaryPattern.test(searchText)) {
            // Use the canonical capitalization from our dictionary
            addSkill(lowerTech, tech);
        }
    }

    // =========================================================================
    // PHASE 2: Skills Section Contextual Trust
    // If something is explicitly listed in the Skills section, trust it
    // =========================================================================
    if (content && content.trim()) {
        // Split by common delimiters: comma, pipe, bullet, newline, semicolon
        const items = content
            .split(/[,|•◦▪▸►➤→;\n]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const item of items) {
            // Clean up the item (remove leading/trailing special chars)
            let cleanItem = item
                .replace(/^[\s\-:]+/, "")
                .replace(/[\s\-:]+$/, "")
                .trim();

            // Skip if too long (likely a sentence, not a skill)
            if (!isValidSkillCandidate(cleanItem)) continue;

            // First, check if it matches a known keyword (case-insensitive)
            const lowerItem = cleanItem.toLowerCase();
            let foundInDict = false;

            for (const tech of TECH_KEYWORDS) {
                const lowerTech = tech.toLowerCase();
                // Exact match or the item contains the tech keyword
                if (lowerItem === lowerTech ||
                    (lowerItem.includes(lowerTech) && lowerTech.length >= 3)) {
                    addSkill(lowerTech, tech);
                    foundInDict = true;
                    break;
                }
            }

            // CONTEXTUAL TRUST: If not in dictionary but looks valid,
            // accept it as a skill (preserving original capitalization)
            if (!foundInDict && isValidSkillCandidate(cleanItem)) {
                // Apply smart capitalization: keep original if it has mixed case,
                // otherwise title case it
                const hasUpperCase = /[A-Z]/.test(cleanItem);
                const hasLowerCase = /[a-z]/.test(cleanItem);
                const isMixedCase = hasUpperCase && hasLowerCase;

                let finalSkill: string;
                if (isMixedCase || cleanItem === cleanItem.toUpperCase()) {
                    // Keep original capitalization (e.g., "FastAPI", "AWS", "Node.js")
                    finalSkill = cleanItem;
                } else {
                    // Title case for lowercase entries
                    finalSkill = cleanItem
                        .split(" ")
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(" ");
                }

                addSkill(normalizeSkillName(finalSkill), finalSkill);
            }
        }

        // Also try to catch colon-separated skill categories like "Languages: Python, Java"
        const colonSections = content.split(/\n/);
        for (const section of colonSections) {
            if (section.includes(":")) {
                const afterColon = section.split(":").slice(1).join(":").trim();
                if (afterColon) {
                    const subItems = afterColon.split(/[,|;]+/).map(s => s.trim());
                    for (const subItem of subItems) {
                        if (isValidSkillCandidate(subItem)) {
                            // Check dictionary first
                            const lowerSub = subItem.toLowerCase();
                            let found = false;
                            for (const tech of TECH_KEYWORDS) {
                                if (lowerSub === tech.toLowerCase()) {
                                    addSkill(tech.toLowerCase(), tech);
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                addSkill(normalizeSkillName(subItem), subItem);
                            }
                        }
                    }
                }
            }
        }
    }

    // Convert map values to sorted array
    return Array.from(skillsMap.values()).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
    );
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

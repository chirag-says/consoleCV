// ConsoleCV - About Page
// Premium about page showcasing the creator and product story

import Link from "next/link";
import {
    Terminal,
    Github,
    Linkedin,
    ArrowRight,
    Code2,
    Rocket,
    Zap,
    Database,
    Cloud,
    Sparkles,
    Heart,
    Coffee,
    Layers,
    Shield,
    Globe,
    Mail,
} from "lucide-react";

// =============================================================================
// SKILL BADGE COMPONENT
// =============================================================================

function SkillBadge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "primary" | "accent" }) {
    const variants = {
        default: "bg-slate-800/50 border-slate-700/50 text-slate-300",
        primary: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        accent: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}>
            {children}
        </span>
    );
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
    return (
        <div className="text-center p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
        </div>
    );
}

// =============================================================================
// MAIN ABOUT PAGE
// =============================================================================

export default function AboutPage() {
    const skills = {
        languages: ["Java", "Python", "JavaScript", "TypeScript", "SQL"],
        frontend: ["React 19", "Next.js 15", "TailwindCSS", "Framer Motion"],
        backend: ["Node.js", "Express", "FastAPI", "MongoDB", "PostgreSQL"],
        devops: ["AWS", "Docker", "CI/CD", "Vercel", "GitHub Actions"],
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <Terminal className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">ConsoleCV</span>
                        </Link>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Link
                                href="/"
                                className="px-3 sm:px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                            >
                                Home
                            </Link>
                            <Link
                                href="/register"
                                className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10">
                {/* Hero Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
                    <div className="text-center mb-12 sm:mb-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm mb-6 sm:mb-8">
                            <Heart className="w-4 h-4 text-rose-400" />
                            <span className="text-slate-300">Made with passion in India</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                            About{" "}
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                ConsoleCV
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed px-4">
                            A modern resume builder crafted for developers who want their career documents
                            to reflect their code quality — clean, efficient, and impressive.
                        </p>
                    </div>

                    {/* Creator Card */}
                    <div className="max-w-4xl mx-auto">
                        <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl overflow-hidden">
                            {/* Gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

                            <div className="p-6 sm:p-10">
                                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                                    {/* Avatar/Terminal */}
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 blur-2xl opacity-30" />
                                            <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center overflow-hidden">
                                                {/* Terminal-style avatar */}
                                                <div className="text-center p-4">
                                                    <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                                        C
                                                    </div>
                                                    <div className="mt-2 font-mono text-xs text-slate-500">
                                                        ~/chirag
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div className="flex-1 text-center lg:text-left">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                            Chirag
                                        </h2>
                                        <p className="text-emerald-400 font-medium mb-4">
                                            Full-Stack Developer & Creator
                                        </p>
                                        <p className="text-slate-400 leading-relaxed mb-6">
                                            A results-oriented Software Engineer with expertise in architecting
                                            Full-Stack (MERN) and IoT solutions. Passionate about building scalable
                                            applications and solving data-intensive problems. Currently pursuing
                                            B.E. in Computer Science at Atria Institute of Technology, Bengaluru.
                                        </p>

                                        {/* Social Links */}
                                        <div className="flex items-center justify-center lg:justify-start gap-3">
                                            <a
                                                href="https://github.com/chirag-says"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-all"
                                            >
                                                <Github className="w-4 h-4" />
                                                <span className="text-sm">GitHub</span>
                                            </a>
                                            <a
                                                href="https://linkedin.com/in/chirag-says"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-all"
                                            >
                                                <Linkedin className="w-4 h-4" />
                                                <span className="text-sm">LinkedIn</span>
                                            </a>
                                            <a
                                                href="mailto:chirag@consolecv.app"
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-all"
                                            >
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">Contact</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="border-t border-slate-800/50 bg-slate-900/20">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            <StatCard value="40%" icon={Zap} label="Latency Optimized" />
                            <StatCard value="10K+" icon={Database} label="Data Points/Day" />
                            <StatCard value="99.5%" icon={Shield} label="Uptime Achieved" />
                            <StatCard value="8.5" icon={Sparkles} label="CGPA" />
                        </div>
                    </div>
                </section>

                {/* Tech Stack Section */}
                <section className="border-t border-slate-800/50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                Built With Modern Tech
                            </h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">
                                ConsoleCV is powered by a carefully selected technology stack
                                ensuring performance, security, and scalability.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Languages */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <Code2 className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h3 className="font-semibold text-white">Languages</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.languages.map((skill) => (
                                        <SkillBadge key={skill}>{skill}</SkillBadge>
                                    ))}
                                </div>
                            </div>

                            {/* Frontend */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <h3 className="font-semibold text-white">Frontend</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.frontend.map((skill) => (
                                        <SkillBadge key={skill} variant="accent">{skill}</SkillBadge>
                                    ))}
                                </div>
                            </div>

                            {/* Backend */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <Database className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <h3 className="font-semibold text-white">Backend</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.backend.map((skill) => (
                                        <SkillBadge key={skill} variant="primary">{skill}</SkillBadge>
                                    ))}
                                </div>
                            </div>

                            {/* DevOps */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                        <Cloud className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <h3 className="font-semibold text-white">DevOps</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.devops.map((skill) => (
                                        <SkillBadge key={skill}>{skill}</SkillBadge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="border-t border-slate-800/50 bg-slate-900/30">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm mb-6">
                                <Coffee className="w-4 h-4 text-amber-400" />
                                <span className="text-slate-300">The Story</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                Why I Built ConsoleCV
                            </h2>
                        </div>

                        <div className="prose prose-invert prose-slate max-w-none">
                            <div className="space-y-6 text-slate-400 leading-relaxed">
                                <p className="text-lg">
                                    As a software engineering intern, I found myself constantly updating
                                    my resume — tweaking bullet points, adding new projects, and trying
                                    to make everything fit on one page. The existing tools felt clunky,
                                    designed for a different era.
                                </p>
                                <p className="text-lg">
                                    I wanted something that felt like <span className="text-white font-medium">home</span> —
                                    a terminal-like interface that developers would actually enjoy using.
                                    Something that could import GitHub repos automatically, suggest
                                    action-oriented bullet points, and export clean PDFs.
                                </p>
                                <p className="text-lg">
                                    <span className="text-emerald-400 font-medium">ConsoleCV</span> was born
                                    from this frustration. It&apos;s the resume builder I wished existed when
                                    I started applying for internships. Built by a developer, for developers.
                                </p>
                            </div>
                        </div>

                        {/* Terminal Quote */}
                        <div className="mt-10 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <span className="ml-4 text-sm text-slate-400 font-mono">
                                    ~/philosophy
                                </span>
                            </div>
                            <div className="p-6 font-mono text-sm">
                                <p className="text-slate-300">
                                    <span className="text-emerald-400">$</span> echo $MISSION
                                </p>
                                <p className="text-cyan-400 mt-2">
                                    &quot;Make every developer&apos;s job search a little less painful.&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="border-t border-slate-800/50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-sm mb-6">
                            <Rocket className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Ready to get started?</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Build Your Resume Today
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                            Join hundreds of developers who&apos;ve already created their
                            professional resumes with ConsoleCV.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
                            >
                                Start Building — It&apos;s Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
                            >
                                <Globe className="w-5 h-5" />
                                View Features
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-800/50 py-8 sm:py-12">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                    <Terminal className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-slate-400 text-sm">
                                    © {new Date().getFullYear()} ConsoleCV
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm">
                                Designed & Built by{" "}
                                <a
                                    href="https://github.com/chirag-says"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                    Chirag
                                </a>
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                                    Home
                                </Link>
                                <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                                    About
                                </Link>
                                <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}

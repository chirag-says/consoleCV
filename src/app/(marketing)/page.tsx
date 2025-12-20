// ConsoleCV - Marketing Landing Page
// Terminal-aesthetic hero section with call to action

import Link from "next/link";
import {
    Terminal,
    Github,
    FileText,
    Zap,
    Share2,
    Code2,
    ArrowRight,
    Sparkles,
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

            {/* Navigation */}
            <nav className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <Terminal className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">ConsoleCV</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10">
                <div className="max-w-6xl mx-auto px-6 pt-20 pb-32">
                    {/* Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-300">
                                Built for Software Interns
                            </span>
                        </div>
                    </div>

                    {/* Main Heading */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                            Your Resume,
                            <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Developer Style
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Build professional resumes with a terminal aesthetic. Import your
                            GitHub projects, get smart bullet suggestions, and share with a
                            single link.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/register"
                            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
                        >
                            Start Building
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
                        >
                            <Github className="w-5 h-5" />
                            View Demo
                        </Link>
                    </div>

                    {/* Terminal Preview */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                            {/* Terminal Header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <span className="ml-4 text-sm text-slate-400 font-mono">
                                    ~ consolecv build resume.json
                                </span>
                            </div>
                            {/* Terminal Content */}
                            <div className="p-6 font-mono text-sm">
                                <div className="space-y-2 text-slate-300">
                                    <p>
                                        <span className="text-emerald-400">$</span> Initializing
                                        resume builder...
                                    </p>
                                    <p>
                                        <span className="text-emerald-400">$</span> Loading modules:{" "}
                                        <span className="text-cyan-400">
                                            [personal, education, projects, skills]
                                        </span>
                                    </p>
                                    <p>
                                        <span className="text-emerald-400">$</span> Importing GitHub
                                        repos from{" "}
                                        <span className="text-yellow-400">@yourusername</span>
                                    </p>
                                    <p>
                                        <span className="text-emerald-400">$</span> Found{" "}
                                        <span className="text-purple-400">6</span> pinned
                                        repositories
                                    </p>
                                    <p>
                                        <span className="text-emerald-400">$</span> Generating smart
                                        bullet points...
                                    </p>
                                    <p className="text-green-400 pt-2">
                                        ✓ Resume ready! Preview at: consolecv.app/yourusername
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="border-t border-slate-800/50 bg-slate-900/30">
                    <div className="max-w-6xl mx-auto px-6 py-24">
                        <h2 className="text-3xl font-bold text-white text-center mb-16">
                            Everything You Need
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center mb-4">
                                    <Github className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    GitHub Import
                                </h3>
                                <p className="text-slate-400">
                                    Automatically import your pinned repositories as projects
                                    with one click.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Smart Suggestions
                                </h3>
                                <p className="text-slate-400">
                                    Type keywords like React or Python and get instant bullet
                                    point suggestions.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center mb-4">
                                    <Share2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Shareable Link
                                </h3>
                                <p className="text-slate-400">
                                    Get a public link like consolecv.app/username to share your
                                    resume anywhere.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center mb-4">
                                    <FileText className="w-6 h-6 text-orange-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    PDF Export
                                </h3>
                                <p className="text-slate-400">
                                    Download your resume as a perfectly formatted A4 PDF document.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center mb-4">
                                    <Code2 className="w-6 h-6 text-pink-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Live Preview
                                </h3>
                                <p className="text-slate-400">
                                    See your changes instantly with our real-time split-screen
                                    editor.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-4">
                                    <Terminal className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Developer First
                                </h3>
                                <p className="text-slate-400">
                                    Built with developers in mind. Clean, minimal, and
                                    professional.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-slate-800/50 py-8">
                    <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-sm">
                        <p>
                            © {new Date().getFullYear()} ConsoleCV. Built for software
                            interns, by developers.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Lock, Mail, User, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setFieldErrors({});

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle field-specific errors
                if (data.details) {
                    setFieldErrors(data.details);
                }
                throw new Error(data.error || "Registration failed");
            }

            // Automatically redirect to login
            router.push("/login?registered=true");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <Terminal className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">ConsoleCV</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-white">Create an account</h2>
                    <p className="mt-2 text-slate-400">Start building your developer resume</p>
                </div>

                {/* Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-950 border ${fieldErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${fieldErrors.name ? 'focus:ring-red-500/20' : 'focus:ring-emerald-500/50'} transition-all`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {fieldErrors.name && (
                                <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-950 border ${fieldErrors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${fieldErrors.email ? 'focus:ring-red-500/20' : 'focus:ring-emerald-500/50'} transition-all`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-10 pr-12 py-3 bg-slate-950 border ${fieldErrors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${fieldErrors.password ? 'focus:ring-red-500/20' : 'focus:ring-emerald-500/50'} transition-all`}
                                    placeholder="At least 6 characters"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

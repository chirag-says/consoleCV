"use client";

// InternDeck - Smart Textarea Component
// Suggests bullet points when user types specific keywords

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface SmartTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    rows?: number;
}

// Keyword to bullet suggestions mapping
const KEYWORD_SUGGESTIONS: Record<string, string[]> = {
    react: [
        "• Built responsive UI components using React hooks and functional components",
        "• Implemented state management using React Context/Redux",
        "• Optimized rendering performance with React.memo and useMemo",
    ],
    python: [
        "• Developed automation scripts using Python for data processing",
        "• Built REST APIs using Flask/FastAPI framework",
        "• Implemented data analysis pipelines with pandas and numpy",
    ],
    javascript: [
        "• Developed interactive web applications using vanilla JavaScript",
        "• Implemented asynchronous operations using Promises and async/await",
        "• Built reusable modules following ES6+ standards",
    ],
    typescript: [
        "• Built type-safe applications with TypeScript strict mode",
        "• Designed robust interfaces and type definitions",
        "• Improved code maintainability with strong typing",
    ],
    node: [
        "• Built scalable backend services using Node.js and Express",
        "• Implemented RESTful APIs with proper error handling",
        "• Managed asynchronous operations with modern JavaScript patterns",
    ],
    database: [
        "• Designed and optimized database schemas",
        "• Wrote efficient queries for data retrieval and manipulation",
        "• Implemented data migration and backup strategies",
    ],
    api: [
        "• Designed and implemented RESTful API endpoints",
        "• Integrated third-party APIs and services",
        "• Documented API specifications using OpenAPI/Swagger",
    ],
    testing: [
        "• Wrote unit tests achieving 80%+ code coverage",
        "• Implemented integration and E2E testing strategies",
        "• Set up CI/CD pipelines for automated testing",
    ],
    git: [
        "• Managed version control using Git with feature branching",
        "• Conducted code reviews and resolved merge conflicts",
        "• Followed conventional commit standards",
    ],
    docker: [
        "• Containerized applications using Docker",
        "• Built multi-stage Docker builds for optimized images",
        "• Managed container orchestration with Docker Compose",
    ],
    aws: [
        "• Deployed applications on AWS infrastructure",
        "• Configured AWS services (EC2, S3, Lambda, RDS)",
        "• Implemented serverless architectures using AWS Lambda",
    ],
    machine: [
        "• Developed ML models for prediction and classification",
        "• Preprocessed and analyzed large datasets",
        "• Evaluated model performance using standard metrics",
    ],
};

export default function SmartTextarea({
    value,
    onChange,
    placeholder = "Start typing...",
    className = "",
    rows = 4,
}: SmartTextareaProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Detect keywords and show suggestions
    const detectKeywords = useCallback((text: string) => {
        const words = text.toLowerCase().split(/\s+/);
        const lastWords = words.slice(-3).join(" ");

        for (const keyword of Object.keys(KEYWORD_SUGGESTIONS)) {
            if (lastWords.includes(keyword)) {
                const newSuggestions = KEYWORD_SUGGESTIONS[keyword].filter(
                    (suggestion) => !text.includes(suggestion)
                );
                if (newSuggestions.length > 0) {
                    setSuggestions(newSuggestions);
                    setShowSuggestions(true);
                    return;
                }
            }
        }
        setShowSuggestions(false);
    }, []);

    // Handle text change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        detectKeywords(newValue);
    };

    // Insert suggestion into textarea
    const insertSuggestion = (suggestion: string) => {
        const newValue = value.trim() ? `${value}\n${suggestion}` : suggestion;
        onChange(newValue);
        setShowSuggestions(false);
        textareaRef.current?.focus();
    };

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                textareaRef.current &&
                !textareaRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={rows}
                className={`w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all ${className}`}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-fade-in"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-slate-700">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-slate-300">
                            Smart Suggestions
                        </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => insertSuggestion(suggestion)}
                                className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors border-b border-slate-700/50 last:border-0"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

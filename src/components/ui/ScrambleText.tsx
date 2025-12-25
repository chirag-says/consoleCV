"use client";

// ConsoleCV - Scramble Text Effect
// Creates a "hacker" decryption effect where text scrambles through random characters
// before revealing the actual content - perfect for futuristic/cyberpunk UI

import React, { useState, useEffect, useCallback, useRef } from "react";

// =============================================================================
// TYPES
// =============================================================================

interface ScrambleTextProps {
    text: string;
    speed?: number;
    className?: string;
    scrambleChars?: string;
    scrambleIterations?: number;
    delay?: number;
    as?: keyof JSX.IntrinsicElements;
    onComplete?: () => void;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const DEFAULT_SCRAMBLE_CHARS = "!<>-_\\/[]{}?&%#@$█▓▒░";
const DEFAULT_SPEED = 50; // ms per iteration
const DEFAULT_ITERATIONS = 15; // number of scramble cycles before revealing

// =============================================================================
// COMPONENT
// =============================================================================

export default function ScrambleText({
    text,
    speed = DEFAULT_SPEED,
    className = "",
    scrambleChars = DEFAULT_SCRAMBLE_CHARS,
    scrambleIterations = DEFAULT_ITERATIONS,
    delay = 0,
    as: Component = "span",
    onComplete,
}: ScrambleTextProps) {
    const [displayText, setDisplayText] = useState<string>("");
    const [isScrambling, setIsScrambling] = useState(false);
    const iterationRef = useRef(0);
    const revealedRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasStartedRef = useRef(false);

    // Generate a random character from the scramble set
    const getRandomChar = useCallback(() => {
        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
    }, [scrambleChars]);

    // Generate scrambled text with progressive reveal
    const generateScrambledText = useCallback((originalText: string, revealedCount: number) => {
        let result = "";

        for (let i = 0; i < originalText.length; i++) {
            if (i < revealedCount) {
                // This character is revealed
                result += originalText[i];
            } else if (originalText[i] === " ") {
                // Preserve spaces
                result += " ";
            } else {
                // Scramble this character
                result += getRandomChar();
            }
        }

        return result;
    }, [getRandomChar]);

    // Start the scramble animation
    const startScramble = useCallback(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        setIsScrambling(true);
        iterationRef.current = 0;
        revealedRef.current = 0;

        // Initial scrambled text
        setDisplayText(generateScrambledText(text, 0));

        intervalRef.current = setInterval(() => {
            iterationRef.current++;

            // Calculate how many characters should be revealed based on progress
            const progress = iterationRef.current / scrambleIterations;
            const targetRevealed = Math.floor(progress * text.length);

            // Reveal characters progressively
            if (targetRevealed > revealedRef.current) {
                revealedRef.current = targetRevealed;
            }

            // Generate new scrambled text with revealed portion
            const newText = generateScrambledText(text, revealedRef.current);
            setDisplayText(newText);

            // Check if complete (all characters revealed)
            if (revealedRef.current >= text.length) {
                // Ensure final text is exactly correct
                setDisplayText(text);
                setIsScrambling(false);

                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }

                onComplete?.();
            }
        }, speed);
    }, [text, speed, scrambleIterations, generateScrambledText, onComplete]);

    // Handle text changes - restart animation
    useEffect(() => {
        // Reset state for new text
        hasStartedRef.current = false;
        iterationRef.current = 0;
        revealedRef.current = 0;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Start with delay if specified
        const timeoutId = setTimeout(() => {
            startScramble();
        }, delay);

        return () => {
            clearTimeout(timeoutId);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [text, delay, startScramble]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <Component
            className={`${className} ${isScrambling ? "scrambling" : ""}`}
            data-scrambling={isScrambling}
        >
            {displayText || text}
        </Component>
    );
}

// =============================================================================
// ADDITIONAL EXPORTS
// =============================================================================

// Inline scramble text for one-time mounting scenarios
export function ScrambleTextOnce({
    text,
    speed = DEFAULT_SPEED,
    className = "",
    as: Component = "span",
}: Omit<ScrambleTextProps, "delay" | "onComplete">) {
    const [displayText, setDisplayText] = useState("");
    const hasRunRef = useRef(false);

    useEffect(() => {
        if (hasRunRef.current) return;
        hasRunRef.current = true;

        const chars = DEFAULT_SCRAMBLE_CHARS;
        let iteration = 0;
        const totalIterations = 20;

        const interval = setInterval(() => {
            let result = "";
            const revealedCount = Math.floor((iteration / totalIterations) * text.length);

            for (let i = 0; i < text.length; i++) {
                if (i < revealedCount) {
                    result += text[i];
                } else if (text[i] === " ") {
                    result += " ";
                } else {
                    result += chars[Math.floor(Math.random() * chars.length)];
                }
            }

            setDisplayText(result);
            iteration++;

            if (iteration > totalIterations) {
                setDisplayText(text);
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return <Component className={className}>{displayText || text}</Component>;
}

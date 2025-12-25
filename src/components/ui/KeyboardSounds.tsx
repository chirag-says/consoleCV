"use client";

// ConsoleCV - Keyboard Sound Effects
// Provides satisfying mechanical keyboard sounds on keypress
// Features random pitch variation to avoid robotic repetition

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface SoundContextType {
    isEnabled: boolean;
    setIsEnabled: (enabled: boolean) => void;
    toggleSound: () => void;
    playClick: () => void;
}

// =============================================================================
// SOUND DATA
// =============================================================================

// Base64 encoded mechanical keyboard click sound (very short, high quality)
// This is a minimal click sound that sounds professional
const CLICK_SOUND_BASE64 = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAYYYRHCUUAAAAAAD/+0DEAAAH+ANv0AAAJOsNbPM4wAAAgBACAEAIAAMJzw+D4fg+BAGHeBAEfn/5c5/l/8PggCAIEIQhiGNiSKIBSZCORyIxoJAnEk/kIQhCEIQhCEIFE4nh8Ph8EAQBwfD5+fLly5cuXPz8/u7u7u7g+D4IAQBAEAQBAP/+fb///u4Pg+CAIAgCAIAgH/y////Lg+Hg+CAIAh///u7y5c/y7/l3/5d////yXOQxDCOJRHJRJI5Ho8DgQBA2D4eAwOBBJQv4mD+eIxjB0fDgQBgWB4Ph4Hg+Dw8DgQBAEAYGAePDwOBAECYOD4fDxmBwJgwLg+D4PJaDIMoMg+D4PAaCIIg+D+BgQBhJAwPD4fD4Ph4Dg+CA+CAQB4GAwPA4Hg+CAEAQB4HAwOBAEAQBgYD4Pg8Ph4DgQBwPDwPB4EB4Pg8HgNg8DwQBgYD4eAwPB8HgeCAIA8HwQBgYDweB4EAQBA";

// Alternative sounds for variety (slightly different pitches/tones)
const SOUNDS = {
    click1: CLICK_SOUND_BASE64,
};

// =============================================================================
// CONTEXT
// =============================================================================

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface SoundProviderProps {
    children: React.ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
    const [isEnabled, setIsEnabled] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const lastPlayedRef = useRef<number>(0);

    // Initialize audio context and load sound
    useEffect(() => {
        // Load user preference from localStorage
        const saved = localStorage.getItem("consolecv-keyboard-sounds");
        if (saved !== null) {
            setIsEnabled(saved === "true");
        }

        // Preload audio
        const loadAudio = async () => {
            try {
                // Create audio context on first interaction
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                }

                // Decode the base64 audio
                const response = await fetch(SOUNDS.click1);
                const arrayBuffer = await response.arrayBuffer();
                audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
            } catch (error) {
                console.warn("[SoundProvider] Failed to load audio:", error);
            }
        };

        loadAudio();

        // Cleanup
        return () => {
            if (audioContextRef.current?.state !== "closed") {
                audioContextRef.current?.close();
            }
        };
    }, []);

    // Play click sound with pitch variation
    const playClick = useCallback(() => {
        if (!isEnabled) return;

        // Debounce rapid clicks (5ms minimum between sounds)
        const now = Date.now();
        if (now - lastPlayedRef.current < 5) return;
        lastPlayedRef.current = now;

        try {
            // Resume context if suspended (browser autoplay policy)
            if (audioContextRef.current?.state === "suspended") {
                audioContextRef.current.resume();
            }

            if (!audioContextRef.current || !audioBufferRef.current) {
                // Fallback: create a simple beep
                const ctx = audioContextRef.current || new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                if (!audioContextRef.current) audioContextRef.current = ctx;

                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                // Short click-like sound
                oscillator.frequency.value = 1800 + Math.random() * 400;
                oscillator.type = "sine";

                gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.03);
                return;
            }

            // Play with slight pitch/speed variation
            const source = audioContextRef.current.createBufferSource();
            const gainNode = audioContextRef.current.createGain();

            source.buffer = audioBufferRef.current;
            source.playbackRate.value = 0.9 + Math.random() * 0.2; // 0.9x to 1.1x speed

            gainNode.gain.value = 0.15 + Math.random() * 0.1; // Subtle volume variation

            source.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);

            source.start(0);
        } catch (error) {
            console.warn("[SoundProvider] Failed to play sound:", error);
        }
    }, [isEnabled]);

    // Listen for keyboard events
    useEffect(() => {
        if (!isEnabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only play for alphanumeric keys and common typing keys
            const allowedKeys = [
                "Backspace", "Tab", "Enter", "Space",
                ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), // A-Z
                ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)), // a-z
                ...Array.from({ length: 10 }, (_, i) => String(i)), // 0-9
                ...["-", "=", "[", "]", "\\", ";", "'", ",", ".", "/", "`"],
            ];

            if (allowedKeys.includes(e.key) || e.key.length === 1) {
                playClick();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isEnabled, playClick]);

    // Toggle and save preference
    const toggleSound = useCallback(() => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        localStorage.setItem("consolecv-keyboard-sounds", String(newValue));

        // Resume audio context on user interaction
        if (newValue && audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume();
        }
    }, [isEnabled]);

    // Update localStorage when preference changes
    const handleSetEnabled = useCallback((enabled: boolean) => {
        setIsEnabled(enabled);
        localStorage.setItem("consolecv-keyboard-sounds", String(enabled));
    }, []);

    return (
        <SoundContext.Provider
            value={{
                isEnabled,
                setIsEnabled: handleSetEnabled,
                toggleSound,
                playClick,
            }}
        >
            {children}
        </SoundContext.Provider>
    );
}

// =============================================================================
// HOOK
// =============================================================================

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error("useSound must be used within a SoundProvider");
    }
    return context;
}

// =============================================================================
// TOGGLE BUTTON COMPONENT
// =============================================================================

interface SoundToggleProps {
    className?: string;
}

export function SoundToggle({ className = "" }: SoundToggleProps) {
    const { isEnabled, toggleSound } = useSound();

    return (
        <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-all duration-200 ${isEnabled
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    : "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-400"
                } ${className}`}
            title={isEnabled ? "Disable keyboard sounds" : "Enable keyboard sounds"}
            aria-label={isEnabled ? "Disable keyboard sounds" : "Enable keyboard sounds"}
        >
            {isEnabled ? (
                <Volume2 className="w-4 h-4" />
            ) : (
                <VolumeX className="w-4 h-4" />
            )}
        </button>
    );
}

// =============================================================================
// STANDALONE TOGGLE (for use outside provider)
// =============================================================================

export function StandaloneSoundToggle({ className = "" }: SoundToggleProps) {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("consolecv-keyboard-sounds");
        if (saved !== null) {
            setIsEnabled(saved === "true");
        }
    }, []);

    const toggle = () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        localStorage.setItem("consolecv-keyboard-sounds", String(newValue));
    };

    return (
        <button
            onClick={toggle}
            className={`p-2 rounded-lg transition-all duration-200 ${isEnabled
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    : "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-400"
                } ${className}`}
            title={isEnabled ? "Disable keyboard sounds" : "Enable keyboard sounds"}
            aria-label={isEnabled ? "Disable keyboard sounds" : "Enable keyboard sounds"}
        >
            {isEnabled ? (
                <Volume2 className="w-4 h-4" />
            ) : (
                <VolumeX className="w-4 h-4" />
            )}
        </button>
    );
}

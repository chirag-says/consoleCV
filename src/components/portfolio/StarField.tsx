"use client";

// ConsoleCV - StarField Background Component
// Canvas-based animated starfield/particle effect for the Space theme
// Creates an immersive "deep space" atmosphere

import React, { useEffect, useRef } from "react";

interface Star {
    x: number;
    y: number;
    z: number;
    radius: number;
    color: string;
    velocity: number;
}

interface StarFieldProps {
    starCount?: number;
    speed?: number;
    className?: string;
}

export default function StarField({
    starCount = 200,
    speed = 0.5,
    className = "",
}: StarFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const starsRef = useRef<Star[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        // Initialize stars
        const initStars = () => {
            starsRef.current = [];
            const colors = [
                "rgba(99, 102, 241, 0.8)",   // Indigo
                "rgba(236, 72, 153, 0.8)",   // Pink
                "rgba(139, 92, 246, 0.6)",   // Purple
                "rgba(255, 255, 255, 0.9)",  // White
                "rgba(34, 211, 238, 0.7)",   // Cyan
            ];

            for (let i = 0; i < starCount; i++) {
                starsRef.current.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * canvas.width,
                    radius: Math.random() * 1.5 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    velocity: Math.random() * speed + 0.2,
                });
            }
        };

        // Animation loop
        const animate = () => {
            ctx.fillStyle = "rgba(3, 0, 20, 0.2)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            starsRef.current.forEach((star) => {
                // Move star towards viewer
                star.z -= star.velocity;

                // Reset star if it passes the screen
                if (star.z <= 0) {
                    star.x = Math.random() * canvas.width - centerX;
                    star.y = Math.random() * canvas.height - centerY;
                    star.z = canvas.width;
                }

                // Project 3D to 2D
                const k = 128 / star.z;
                const projectedX = star.x * k + centerX;
                const projectedY = star.y * k + centerY;

                // Size based on distance
                const size = (1 - star.z / canvas.width) * star.radius * 3;

                // Draw star
                ctx.beginPath();
                ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2);
                ctx.fillStyle = star.color;
                ctx.fill();

                // Add glow effect for larger stars
                if (size > 1.5) {
                    ctx.beginPath();
                    ctx.arc(projectedX, projectedY, size * 2, 0, Math.PI * 2);
                    const gradient = ctx.createRadialGradient(
                        projectedX, projectedY, 0,
                        projectedX, projectedY, size * 2
                    );
                    gradient.addColorStop(0, star.color);
                    gradient.addColorStop(1, "transparent");
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [starCount, speed]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none ${className}`}
            style={{ zIndex: 0 }}
        />
    );
}

"use client";

// ConsoleCV - Neural Network Background
// Interactive canvas background with floating nodes and constellation-like connections
// Creates a high-tech, cyberpunk atmosphere for the futuristic console theme

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Power, PowerOff } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    pulsePhase: number;
}

interface MousePosition {
    x: number;
    y: number;
}

interface NetworkBackgroundProps {
    nodeCount?: number;
    connectionDistance?: number;
    mouseInfluenceDistance?: number;
    color?: string;
    className?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const DEFAULT_NODE_COUNT = 75;
const DEFAULT_CONNECTION_DISTANCE = 150;
const DEFAULT_MOUSE_INFLUENCE_DISTANCE = 200;
const NODE_MIN_RADIUS = 1.5;
const NODE_MAX_RADIUS = 3;
const NODE_SPEED = 0.3;
const PULSE_SPEED = 0.02;

// =============================================================================
// COMPONENT
// =============================================================================

export default function NetworkBackground({
    nodeCount = DEFAULT_NODE_COUNT,
    connectionDistance = DEFAULT_CONNECTION_DISTANCE,
    mouseInfluenceDistance = DEFAULT_MOUSE_INFLUENCE_DISTANCE,
    color = "16, 185, 129", // Emerald RGB
    className = "",
}: NetworkBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<Node[]>([]);
    const mouseRef = useRef<MousePosition>({ x: -1000, y: -1000 });
    const animationFrameRef = useRef<number>(0);
    const [isEnabled, setIsEnabled] = useState(true);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Initialize nodes
    const initNodes = useCallback((width: number, height: number) => {
        const nodes: Node[] = [];
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * NODE_SPEED,
                vy: (Math.random() - 0.5) * NODE_SPEED,
                radius: NODE_MIN_RADIUS + Math.random() * (NODE_MAX_RADIUS - NODE_MIN_RADIUS),
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }
        nodesRef.current = nodes;
    }, [nodeCount]);

    // Update node positions
    const updateNodes = useCallback((width: number, height: number) => {
        const mouse = mouseRef.current;

        nodesRef.current.forEach((node) => {
            // Update pulse phase
            node.pulsePhase += PULSE_SPEED;

            // Mouse interaction - nodes gently drift toward mouse
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const distToMouse = Math.sqrt(dx * dx + dy * dy);

            if (distToMouse < mouseInfluenceDistance && distToMouse > 0) {
                const influence = (1 - distToMouse / mouseInfluenceDistance) * 0.02;
                node.vx += dx / distToMouse * influence;
                node.vy += dy / distToMouse * influence;
            }

            // Apply velocity with damping
            node.vx *= 0.99;
            node.vy *= 0.99;

            // Update position
            node.x += node.vx;
            node.y += node.vy;

            // Boundary wrapping (seamless edges)
            if (node.x < -50) node.x = width + 50;
            if (node.x > width + 50) node.x = -50;
            if (node.y < -50) node.y = height + 50;
            if (node.y > height + 50) node.y = -50;
        });
    }, [mouseInfluenceDistance]);

    // Draw the network
    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const mouse = mouseRef.current;
        const nodes = nodesRef.current;

        // Clear canvas with subtle gradient
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.clearRect(0, 0, width, height);

        // Draw connections between nearby nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    // Calculate opacity based on distance
                    const opacity = (1 - distance / connectionDistance) * 0.3;

                    // Check if either node is near mouse for glow effect
                    const node1ToMouse = Math.sqrt(
                        Math.pow(nodes[i].x - mouse.x, 2) + Math.pow(nodes[i].y - mouse.y, 2)
                    );
                    const node2ToMouse = Math.sqrt(
                        Math.pow(nodes[j].x - mouse.x, 2) + Math.pow(nodes[j].y - mouse.y, 2)
                    );
                    const nearMouse = Math.min(node1ToMouse, node2ToMouse) < mouseInfluenceDistance;

                    // Enhanced glow when near mouse
                    if (nearMouse) {
                        ctx.strokeStyle = `rgba(${color}, ${opacity * 2})`;
                        ctx.lineWidth = 1.5;
                        ctx.shadowColor = `rgba(${color}, 0.5)`;
                        ctx.shadowBlur = 10;
                    } else {
                        ctx.strokeStyle = `rgba(${color}, ${opacity * 0.5})`;
                        ctx.lineWidth = 0.5;
                        ctx.shadowBlur = 0;
                    }

                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Reset shadow for nodes
        ctx.shadowBlur = 0;

        // Draw nodes with pulse effect
        nodes.forEach((node) => {
            const distToMouse = Math.sqrt(
                Math.pow(node.x - mouse.x, 2) + Math.pow(node.y - mouse.y, 2)
            );
            const nearMouse = distToMouse < mouseInfluenceDistance;

            // Pulsing radius
            const pulseMultiplier = 1 + Math.sin(node.pulsePhase) * 0.2;
            const finalRadius = node.radius * pulseMultiplier;

            // Enhanced glow when near mouse
            if (nearMouse) {
                const intensity = 1 - distToMouse / mouseInfluenceDistance;

                // Outer glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, finalRadius * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${intensity * 0.3})`;
                ctx.fill();

                // Inner glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, finalRadius * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${intensity * 0.6})`;
                ctx.fill();
            }

            // Core node
            ctx.beginPath();
            ctx.arc(node.x, node.y, finalRadius, 0, Math.PI * 2);
            ctx.fillStyle = nearMouse
                ? `rgba(${color}, 1)`
                : `rgba(${color}, 0.6)`;
            ctx.fill();
        });

        // Draw lines to mouse from nearby nodes
        nodes.forEach((node) => {
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseInfluenceDistance * 0.8) {
                const opacity = (1 - distance / (mouseInfluenceDistance * 0.8)) * 0.4;

                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(${color}, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.shadowColor = `rgba(${color}, 0.8)`;
                ctx.shadowBlur = 15;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        });
    }, [connectionDistance, mouseInfluenceDistance, color]);

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isEnabled) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = dimensions;

        updateNodes(width, height);
        draw(ctx, width, height);

        animationFrameRef.current = requestAnimationFrame(animate);
    }, [dimensions, isEnabled, updateNodes, draw]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Initialize nodes when dimensions change
    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0) {
            initNodes(dimensions.width, dimensions.height);
        }
    }, [dimensions, initNodes]);

    // Set canvas dimensions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && dimensions.width > 0) {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
        }
    }, [dimensions]);

    // Handle mouse movement
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    // Start/stop animation
    useEffect(() => {
        if (isEnabled && dimensions.width > 0) {
            animate();
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isEnabled, animate, dimensions]);

    // Load preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("consolecv-network-bg");
        if (saved !== null) {
            setIsEnabled(saved === "true");
        }
    }, []);

    // Save preference to localStorage
    const toggleEnabled = () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        localStorage.setItem("consolecv-network-bg", String(newValue));
    };

    return (
        <>
            {/* Canvas Background */}
            <canvas
                ref={canvasRef}
                className={`fixed inset-0 pointer-events-none z-0 ${className}`}
                style={{
                    opacity: isEnabled ? 1 : 0,
                    transition: "opacity 0.5s ease-in-out",
                }}
            />

            {/* Toggle Button */}
            <button
                onClick={toggleEnabled}
                className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-slate-900/80 border border-slate-700/50 
                           hover:bg-slate-800/80 hover:border-emerald-500/30 transition-all duration-300 group
                           backdrop-blur-sm shadow-lg"
                title={isEnabled ? "Disable background animation" : "Enable background animation"}
                aria-label={isEnabled ? "Disable background animation" : "Enable background animation"}
            >
                {isEnabled ? (
                    <Power className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                ) : (
                    <PowerOff className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                )}
            </button>
        </>
    );
}

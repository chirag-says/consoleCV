// ConsoleCV - Rate Limiting Module (Bank-Level Security)
// Provides DDoS and brute force protection

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Check if Upstash Redis is configured
 * Falls back to in-memory store for development
 */
const isUpstashConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

/**
 * In-memory store fallback for development (not for production!)
 * This is a simple Map-based implementation that mimics Redis behavior
 */
class InMemoryStore {
    private store: Map<string, { count: number; resetAt: number }> = new Map();

    async get(key: string): Promise<{ count: number; resetAt: number } | null> {
        const data = this.store.get(key);
        if (!data) return null;
        if (Date.now() > data.resetAt) {
            this.store.delete(key);
            return null;
        }
        return data;
    }

    async set(
        key: string,
        count: number,
        resetAt: number
    ): Promise<void> {
        this.store.set(key, { count, resetAt });
    }

    async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
        const existing = await this.get(key);
        if (existing) {
            existing.count++;
            this.store.set(key, existing);
            return existing;
        }
        const resetAt = Date.now() + windowMs;
        this.store.set(key, { count: 1, resetAt });
        return { count: 1, resetAt };
    }
}

const memoryStore = new InMemoryStore();

// =============================================================================
// UPSTASH RATE LIMITERS
// =============================================================================

/**
 * Create Redis client if configured
 */
const redis = isUpstashConfigured
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

/**
 * Rate limiter for unauthenticated requests (stricter)
 * 10 requests per minute per IP
 */
const unauthenticatedLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix: "@consolecv/ratelimit:unauth",
    })
    : null;

/**
 * Rate limiter for authenticated requests (more generous)
 * 100 requests per minute per user
 */
const authenticatedLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "@consolecv/ratelimit:auth",
    })
    : null;

/**
 * Strict rate limiter for auth endpoints (prevent brute force)
 * 5 attempts per minute per IP for login/register
 */
const authEndpointLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "@consolecv/ratelimit:auth-endpoint",
    })
    : null;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extracts client IP from request headers
 * Handles various reverse proxy configurations
 */
export function getClientIp(request: NextRequest): string {
    // Check common headers in order of reliability
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        // Take the first IP (original client)
        return forwardedFor.split(",")[0].trim();
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp.trim();
    }

    // Fallback for local development
    return "127.0.0.1";
}

/**
 * Rate limit result interface
 */
export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix timestamp when the limit resets
}

// =============================================================================
// RATE LIMITING FUNCTIONS
// =============================================================================

/**
 * Memory-based fallback rate limiting
 */
async function memoryRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    const result = await memoryStore.increment(identifier, windowMs);

    return {
        success: result.count <= limit,
        limit,
        remaining: Math.max(0, limit - result.count),
        reset: result.resetAt,
    };
}

/**
 * Rate limit for unauthenticated/public endpoints
 * @param request - Next.js request object
 * @returns Rate limit result
 */
export async function rateLimitPublic(
    request: NextRequest
): Promise<RateLimitResult> {
    const ip = getClientIp(request);

    if (unauthenticatedLimiter) {
        const result = await unauthenticatedLimiter.limit(ip);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    }

    // Fallback to memory-based limiting (development only!)
    console.warn(
        "[Security] Using in-memory rate limiting. Configure Upstash Redis for production!"
    );
    return memoryRateLimit(`unauth:${ip}`, 10, 60000);
}

/**
 * Rate limit for authenticated endpoints
 * @param userId - The authenticated user's ID
 * @returns Rate limit result
 */
export async function rateLimitAuthenticated(
    userId: string
): Promise<RateLimitResult> {
    if (authenticatedLimiter) {
        const result = await authenticatedLimiter.limit(userId);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    }

    // Fallback to memory-based limiting
    console.warn(
        "[Security] Using in-memory rate limiting. Configure Upstash Redis for production!"
    );
    return memoryRateLimit(`auth:${userId}`, 100, 60000);
}

/**
 * Strict rate limit for authentication endpoints (login, register)
 * Prevents brute force attacks
 * @param request - Next.js request object
 * @returns Rate limit result
 */
export async function rateLimitAuthEndpoint(
    request: NextRequest
): Promise<RateLimitResult> {
    const ip = getClientIp(request);

    if (authEndpointLimiter) {
        const result = await authEndpointLimiter.limit(ip);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    }

    // Fallback to memory-based limiting
    console.warn(
        "[Security] Using in-memory rate limiting. Configure Upstash Redis for production!"
    );
    return memoryRateLimit(`auth-endpoint:${ip}`, 5, 60000);
}

/**
 * Creates rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
    const headers = new Headers();
    headers.set("X-RateLimit-Limit", result.limit.toString());
    headers.set("X-RateLimit-Remaining", result.remaining.toString());
    headers.set("X-RateLimit-Reset", result.reset.toString());
    return headers;
}

/**
 * Standard rate limit exceeded response
 */
export function rateLimitExceededResponse(result: RateLimitResult): Response {
    return new Response(
        JSON.stringify({
            success: false,
            error: "Too many requests. Please try again later.",
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "X-RateLimit-Limit": result.limit.toString(),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": result.reset.toString(),
                "Retry-After": Math.ceil(
                    (result.reset - Date.now()) / 1000
                ).toString(),
            },
        }
    );
}

// ConsoleCV - User Registration API (Bank-Level Security)
// Creates new user accounts with strict validation, rate limiting, and audit logging

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { userRegistrationSchema, formatZodError } from "@/lib/validations";
import {
    rateLimitAuthEndpoint,
    rateLimitExceededResponse,
    getClientIp,
    createRateLimitHeaders,
} from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown";

    try {
        // =====================================================================
        // STEP 1: Rate Limiting (Brute Force Protection)
        // =====================================================================
        const rateLimitResult = await rateLimitAuthEndpoint(request);

        if (!rateLimitResult.success) {
            // Log rate limit exceeded
            try {
                await dbConnect();
                await AuditLog.log("RATE_LIMIT_EXCEEDED", {
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: "/api/auth/register",
                        method: "POST",
                    },
                });
            } catch {
                // Don't fail if audit logging fails
            }

            return rateLimitExceededResponse(rateLimitResult);
        }

        // =====================================================================
        // STEP 2: Input Validation (XSS, NoSQL Injection Prevention)
        // =====================================================================
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid request body" },
                { status: 400 }
            );
        }

        const validationResult = userRegistrationSchema.safeParse(body);

        if (!validationResult.success) {
            // Log validation failure (potential attack)
            try {
                await dbConnect();
                await AuditLog.log("VALIDATION_FAILED", {
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: "/api/auth/register",
                        method: "POST",
                        errors: formatZodError(validationResult.error).errors,
                    },
                    severity: "MEDIUM",
                });
            } catch {
                // Don't fail if audit logging fails
            }

            const zodError = formatZodError(validationResult.error);
            return NextResponse.json(
                {
                    success: false,
                    error: zodError.message,
                    details: zodError.errors,
                },
                { status: 400 }
            );
        }

        const { name, email, password } = validationResult.data;

        // =====================================================================
        // STEP 3: Database Operations
        // =====================================================================
        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "Email already registered" },
                { status: 409 }
            );
        }

        // Hash password with high cost factor
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // =====================================================================
        // STEP 4: Audit Logging
        // =====================================================================
        await AuditLog.log("USER_REGISTERED", {
            userId: user._id.toString(),
            ipAddress,
            userAgent,
            details: {
                email: user.email,
            },
            severity: "LOW",
        });

        // =====================================================================
        // STEP 5: Return Success Response
        // =====================================================================
        const response = NextResponse.json(
            {
                success: true,
                data: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );

        // Add rate limit headers
        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        rateLimitHeaders.forEach((value, key) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        console.error("Registration error:", error);

        // Log unexpected errors
        try {
            await dbConnect();
            await AuditLog.log("SUSPICIOUS_ACTIVITY", {
                ipAddress,
                userAgent,
                details: {
                    endpoint: "/api/auth/register",
                    method: "POST",
                    error: error instanceof Error ? error.message : "Unknown error",
                },
                severity: "HIGH",
            });
        } catch {
            // Don't fail if audit logging fails
        }

        return NextResponse.json(
            { success: false, error: "Registration failed. Please try again." },
            { status: 500 }
        );
    }
}


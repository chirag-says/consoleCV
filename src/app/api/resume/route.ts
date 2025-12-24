// ConsoleCV - Resume API Route (Bank-Level Security)
// Handles listing user resumes and creating new ones with strict validation

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Resume from "@/models/Resume";
import AuditLog from "@/models/AuditLog";
import { resumeSchema, formatZodError } from "@/lib/validations";
import {
    rateLimitAuthenticated,
    rateLimitExceededResponse,
    getClientIp,
    createRateLimitHeaders,
} from "@/lib/ratelimit";

// GET - Fetch all resumes for the logged-in user
export async function GET(request: NextRequest) {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown";

    try {
        const session = await auth();

        if (!session?.user?.id) {
            // Log unauthorized access attempt
            try {
                await dbConnect();
                await AuditLog.log("UNAUTHORIZED_ACCESS", {
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: "/api/resume",
                        method: "GET",
                    },
                    severity: "HIGH",
                });
            } catch {
                // Don't fail if audit logging fails
            }

            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Rate limiting for authenticated users
        const rateLimitResult = await rateLimitAuthenticated(session.user.id);

        if (!rateLimitResult.success) {
            try {
                await dbConnect();
                await AuditLog.log("RATE_LIMIT_EXCEEDED", {
                    userId: session.user.id,
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: "/api/resume",
                        method: "GET",
                    },
                });
            } catch {
                // Don't fail if audit logging fails
            }

            return rateLimitExceededResponse(rateLimitResult);
        }

        await dbConnect();

        const resumes = await Resume.find({ userId: session.user.id })
            .select("_id title personal.fullName isPrimary isPublic slug updatedAt createdAt")
            .sort({ updatedAt: -1 })
            .lean();

        const response = NextResponse.json(
            { success: true, data: resumes },
            { status: 200 }
        );

        // Add rate limit headers
        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        rateLimitHeaders.forEach((value, key) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        console.error("Error fetching resumes:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch resumes" },
            { status: 500 }
        );
    }
}

// POST - Create a new resume for the logged-in user
export async function POST(request: NextRequest) {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown";

    try {
        const session = await auth();

        if (!session?.user?.id) {
            // Log unauthorized access attempt
            try {
                await dbConnect();
                await AuditLog.log("UNAUTHORIZED_ACCESS", {
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: "/api/resume",
                        method: "POST",
                    },
                    severity: "HIGH",
                });
            } catch {
                // Don't fail if audit logging fails
            }

            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Rate limiting for authenticated users
        const rateLimitResult = await rateLimitAuthenticated(session.user.id);

        if (!rateLimitResult.success) {
            try {
                await dbConnect();
                await AuditLog.log("RATE_LIMIT_EXCEEDED", {
                    userId: session.user.id,
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: "/api/resume",
                        method: "POST",
                    },
                });
            } catch {
                // Don't fail if audit logging fails
            }

            return rateLimitExceededResponse(rateLimitResult);
        }

        // Parse and validate request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid request body" },
                { status: 400 }
            );
        }

        const validationResult = resumeSchema.safeParse(body);

        if (!validationResult.success) {
            // Log validation failure
            try {
                await dbConnect();
                await AuditLog.log("VALIDATION_FAILED", {
                    userId: session.user.id,
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: "/api/resume",
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

        await dbConnect();

        // Check if this is the user's first resume - if so, make it primary
        const existingResumeCount = await Resume.countDocuments({ userId: session.user.id });
        const isFirstResume = existingResumeCount === 0;

        // Create resume with validated data and authenticated user's ID
        const resume = await Resume.create({
            ...validationResult.data,
            userId: session.user.id, // Force userId from session
            isPrimary: isFirstResume, // First resume is automatically primary
            isPublic: false, // Default to private
        });

        // Audit log the creation
        await AuditLog.log("RESUME_CREATED", {
            userId: session.user.id,
            ipAddress,
            userAgent,
            details: {
                resourceId: resume._id.toString(),
                resourceType: "Resume",
                title: resume.title,
            },
            severity: "LOW",
        });

        const response = NextResponse.json(
            { success: true, data: { _id: resume._id.toString() } },
            { status: 201 }
        );

        // Add rate limit headers
        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        rateLimitHeaders.forEach((value, key) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        console.error("Error creating resume:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create resume" },
            { status: 500 }
        );
    }
}

// PATCH - Update resume settings (isPrimary, isPublic, slug) for a specific resume
export async function PATCH(request: NextRequest) {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown";

    try {
        const session = await auth();

        if (!session?.user?.id) {
            try {
                await dbConnect();
                await AuditLog.log("UNAUTHORIZED_ACCESS", {
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: "/api/resume",
                        method: "PATCH",
                    },
                    severity: "HIGH",
                });
            } catch {
                // Don't fail if audit logging fails
            }

            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Rate limiting
        const rateLimitResult = await rateLimitAuthenticated(session.user.id);

        if (!rateLimitResult.success) {
            return rateLimitExceededResponse(rateLimitResult);
        }

        // Parse request body
        let body: { resumeId?: string; isPrimary?: boolean; isPublic?: boolean; slug?: string };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Validate resumeId
        const { resumeId, isPrimary, isPublic, slug } = body;
        if (!resumeId || !/^[a-fA-F0-9]{24}$/.test(resumeId)) {
            return NextResponse.json(
                { success: false, error: "Invalid or missing resumeId" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Verify ownership
        const resume = await Resume.findOne({
            _id: resumeId,
            userId: session.user.id,
        });

        if (!resume) {
            return NextResponse.json(
                { success: false, error: "Resume not found" },
                { status: 404 }
            );
        }

        // Build update object
        const updateFields: { isPrimary?: boolean; isPublic?: boolean; slug?: string } = {};

        // Handle isPrimary - ensure only one primary per user
        if (typeof isPrimary === "boolean") {
            if (isPrimary) {
                // Set all other resumes for this user to isPrimary: false
                await Resume.updateMany(
                    { userId: session.user.id, _id: { $ne: resumeId } },
                    { $set: { isPrimary: false } }
                );
            }
            updateFields.isPrimary = isPrimary;
        }

        // Handle isPublic
        if (typeof isPublic === "boolean") {
            updateFields.isPublic = isPublic;
        }

        // Handle slug
        if (typeof slug === "string") {
            // Validate slug format
            if (slug && !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
                return NextResponse.json(
                    { success: false, error: "Invalid slug format" },
                    { status: 400 }
                );
            }
            updateFields.slug = slug || undefined;
        }

        // Update the resume
        const updatedResume = await Resume.findByIdAndUpdate(
            resumeId,
            { $set: updateFields },
            { new: true }
        );

        // Audit log
        await AuditLog.log("RESUME_UPDATED", {
            userId: session.user.id,
            ipAddress,
            userAgent,
            details: {
                resourceId: resumeId,
                resourceType: "Resume",
                updatedFields: Object.keys(updateFields),
            },
            severity: "LOW",
        });

        const response = NextResponse.json(
            { success: true, data: updatedResume },
            { status: 200 }
        );

        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        rateLimitHeaders.forEach((value, key) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        console.error("Error updating resume settings:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update resume settings" },
            { status: 500 }
        );
    }
}

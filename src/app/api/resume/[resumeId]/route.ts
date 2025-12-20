// ConsoleCV - Single Resume API Route (Bank-Level Security)
// Handles GET, PUT, DELETE for a specific resume with strict validation

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Resume from "@/models/Resume";
import AuditLog from "@/models/AuditLog";
import { resumeUpdateSchema, formatZodError } from "@/lib/validations";
import {
    rateLimitAuthenticated,
    rateLimitExceededResponse,
    getClientIp,
    createRateLimitHeaders,
} from "@/lib/ratelimit";

interface RouteParams {
    params: Promise<{ resumeId: string }>;
}

// Validate MongoDB ObjectId format
function isValidObjectId(id: string): boolean {
    return /^[a-fA-F0-9]{24}$/.test(id);
}

// GET - Fetch a single resume by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown";

    try {
        const session = await auth();
        const { resumeId } = await params;

        // Validate resumeId format to prevent NoSQL injection
        if (!isValidObjectId(resumeId)) {
            return NextResponse.json(
                { success: false, error: "Invalid resume ID format" },
                { status: 400 }
            );
        }

        if (!session?.user?.id) {
            try {
                await dbConnect();
                await AuditLog.log("UNAUTHORIZED_ACCESS", {
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: `/api/resume/${resumeId}`,
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

        // Rate limiting
        const rateLimitResult = await rateLimitAuthenticated(session.user.id);

        if (!rateLimitResult.success) {
            return rateLimitExceededResponse(rateLimitResult);
        }

        await dbConnect();

        const resume = await Resume.findOne({
            _id: resumeId,
            userId: session.user.id,
        }).lean();

        if (!resume) {
            return NextResponse.json(
                { success: false, error: "Resume not found" },
                { status: 404 }
            );
        }

        // Log resume view (optional - can be disabled for performance)
        // await AuditLog.log("RESUME_VIEWED", {
        //     userId: session.user.id,
        //     ipAddress,
        //     userAgent,
        //     details: { resourceId: resumeId },
        // });

        const response = NextResponse.json(
            { success: true, data: resume },
            { status: 200 }
        );

        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        rateLimitHeaders.forEach((value, key) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        console.error("Error fetching resume:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch resume" },
            { status: 500 }
        );
    }
}

// PUT - Update a resume
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown";

    try {
        const session = await auth();
        const { resumeId } = await params;

        // Validate resumeId format
        if (!isValidObjectId(resumeId)) {
            return NextResponse.json(
                { success: false, error: "Invalid resume ID format" },
                { status: 400 }
            );
        }

        if (!session?.user?.id) {
            try {
                await dbConnect();
                await AuditLog.log("UNAUTHORIZED_ACCESS", {
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: `/api/resume/${resumeId}`,
                        method: "PUT",
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

        const validationResult = resumeUpdateSchema.safeParse(body);

        if (!validationResult.success) {
            try {
                await dbConnect();
                await AuditLog.log("VALIDATION_FAILED", {
                    userId: session.user.id,
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: `/api/resume/${resumeId}`,
                        method: "PUT",
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

        // Clean the update data - remove protected fields
        const updateData = { ...validationResult.data };

        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId: session.user.id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!resume) {
            return NextResponse.json(
                { success: false, error: "Resume not found" },
                { status: 404 }
            );
        }

        // Audit log the update
        await AuditLog.log("RESUME_UPDATED", {
            userId: session.user.id,
            ipAddress,
            userAgent,
            details: {
                resourceId: resumeId,
                resourceType: "Resume",
                updatedFields: Object.keys(validationResult.data),
            },
            severity: "LOW",
        });

        const response = NextResponse.json(
            { success: true, data: resume },
            { status: 200 }
        );

        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        rateLimitHeaders.forEach((value, key) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        console.error("Error updating resume:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update resume" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a resume
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown";

    try {
        const session = await auth();
        const { resumeId } = await params;

        // Validate resumeId format
        if (!isValidObjectId(resumeId)) {
            return NextResponse.json(
                { success: false, error: "Invalid resume ID format" },
                { status: 400 }
            );
        }

        if (!session?.user?.id) {
            try {
                await dbConnect();
                await AuditLog.log("UNAUTHORIZED_ACCESS", {
                    ipAddress,
                    userAgent,
                    details: {
                        endpoint: `/api/resume/${resumeId}`,
                        method: "DELETE",
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

        await dbConnect();

        // First, get the resume details for audit log before deletion
        const existingResume = await Resume.findOne({
            _id: resumeId,
            userId: session.user.id,
        }).lean();

        if (!existingResume) {
            return NextResponse.json(
                { success: false, error: "Resume not found" },
                { status: 404 }
            );
        }

        // Now delete
        await Resume.findOneAndDelete({
            _id: resumeId,
            userId: session.user.id,
        });

        // Audit log the deletion (this is a critical action)
        await AuditLog.log("RESUME_DELETED", {
            userId: session.user.id,
            ipAddress,
            userAgent,
            details: {
                resourceId: resumeId,
                resourceType: "Resume",
                title: existingResume.title,
            },
            severity: "MEDIUM", // Deletions are more important
        });

        const response = NextResponse.json(
            { success: true, message: "Resume deleted" },
            { status: 200 }
        );

        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        rateLimitHeaders.forEach((value, key) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        console.error("Error deleting resume:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete resume" },
            { status: 500 }
        );
    }
}


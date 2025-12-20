// ConsoleCV - Single Resume API Route
// Handles GET, PUT, DELETE for a specific resume

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Resume from "@/models/Resume";

interface RouteParams {
    params: Promise<{ resumeId: string }>;
}

// GET - Fetch a single resume by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { resumeId } = await params;

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
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

        return NextResponse.json({ success: true, data: resume }, { status: 200 });
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
    try {
        const session = await auth();
        const { resumeId } = await params;

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await request.json();

        // Remove fields that shouldn't be updated
        delete body._id;
        delete body.userId;
        delete body.createdAt;
        delete body.updatedAt;

        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId: session.user.id },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!resume) {
            return NextResponse.json(
                { success: false, error: "Resume not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: resume },
            { status: 200 }
        );
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
    try {
        const session = await auth();
        const { resumeId } = await params;

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const resume = await Resume.findOneAndDelete({
            _id: resumeId,
            userId: session.user.id,
        });

        if (!resume) {
            return NextResponse.json(
                { success: false, error: "Resume not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Resume deleted" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting resume:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete resume" },
            { status: 500 }
        );
    }
}

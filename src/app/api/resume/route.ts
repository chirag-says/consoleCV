// ConsoleCV - Resume API Route (List & Create)
// Handles listing user resumes and creating new ones

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Resume from "@/models/Resume";

// GET - Fetch all resumes for the logged-in user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const resumes = await Resume.find({ userId: session.user.id })
            .select("_id title personal.fullName updatedAt createdAt")
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: resumes }, { status: 200 });
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
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await request.json();

        // Create resume with authenticated user's ID (override any userId in body)
        const resume = await Resume.create({
            ...body,
            userId: session.user.id, // Force userId from session
            title: body.title || "Untitled Resume",
        });

        return NextResponse.json(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { success: true, data: { _id: (resume as any)._id.toString() } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating resume:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create resume" },
            { status: 500 }
        );
    }
}

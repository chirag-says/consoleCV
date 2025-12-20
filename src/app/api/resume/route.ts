// InternDeck - Resume API Route
// Handles saving and retrieving resumes from MongoDB

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resume from "@/models/Resume";
import type { ResumeData } from "@/types/resume";

// POST - Save a new resume
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const data: ResumeData = await request.json();

        // Create new resume
        const resume = await Resume.create(data);

        return NextResponse.json(
            { success: true, data: resume },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error saving resume:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save resume" },
            { status: 500 }
        );
    }
}

// GET - Retrieve all resumes (for future use)
export async function GET() {
    try {
        await dbConnect();

        const resumes = await Resume.find({})
            .sort({ updatedAt: -1 })
            .limit(10);

        return NextResponse.json(
            { success: true, data: resumes },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching resumes:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch resumes" },
            { status: 500 }
        );
    }
}

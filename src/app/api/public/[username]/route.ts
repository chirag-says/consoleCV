// ConsoleCV - Public Resume API
// Fetches resume by GitHub username (no auth required)

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resume from "@/models/Resume";

interface RouteParams {
    params: Promise<{ username: string }>;
}

// GET - Fetch resume by GitHub username
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { username } = await params;

        if (!username) {
            return NextResponse.json(
                { success: false, error: "Username is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find resume where personal.github matches the username
        const resume = await Resume.findOne({
            "personal.github": { $regex: new RegExp(`^${username}$`, "i") },
        })
            .sort({ updatedAt: -1 }) // Get the most recently updated one
            .lean();

        if (!resume) {
            return NextResponse.json(
                { success: false, error: "Resume not found" },
                { status: 404 }
            );
        }

        // Remove sensitive data
        const publicResume = {
            ...resume,
            userId: undefined,
        };

        return NextResponse.json(
            { success: true, data: publicResume },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching public resume:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch resume" },
            { status: 500 }
        );
    }
}

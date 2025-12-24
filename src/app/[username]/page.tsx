// ConsoleCV - Public Developer Portfolio Page
// Dynamic portfolio page that showcases a developer's resume data
// Uses server-side metadata generation for SEO optimization

import { Metadata } from "next";
import dbConnect from "@/lib/db";
import Resume from "@/models/Resume";
import PortfolioClient from "@/app/[username]/PortfolioClient";

// Type for resume document from MongoDB
interface ResumeDocument {
    personal?: {
        fullName?: string;
        summary?: string;
        github?: string;
    };
    title?: string;
    isPublic?: boolean;
    isPrimary?: boolean;
}

// =============================================================================
// METADATA GENERATION (SEO)
// =============================================================================

interface PageProps {
    params: Promise<{ username: string }>;
}

async function getResumeData(username: string) {
    await dbConnect();

    const resume = await Resume.findOne({
        "personal.github": { $regex: new RegExp(`^${username}$`, "i") },
        isPublic: true,
    })
        .sort({ isPrimary: -1, updatedAt: -1 })
        .lean();

    return resume;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;

    try {
        const resume = await getResumeData(username);

        if (!resume) {
            return {
                title: `${username} - Portfolio Not Found | ConsoleCV`,
                description: `Portfolio for ${username} is not available or not public.`,
            };
        }

        // Extract data for metadata
        const resumeDoc = resume as ResumeDocument;
        const name = resumeDoc.personal?.fullName || username;
        const title = resumeDoc.title || "Software Engineer";
        const summary = resumeDoc.personal?.summary || `${name} is a ${title}. View their portfolio and professional experience.`;

        // Truncate summary for meta description (optimal: 150-160 chars)
        const metaDescription = summary.length > 155
            ? summary.substring(0, 152) + "..."
            : summary;

        return {
            title: `${name} - ${title} | ConsoleCV`,
            description: metaDescription,
            openGraph: {
                title: `${name}'s Portfolio`,
                description: summary,
                type: "profile",
                siteName: "ConsoleCV",
                images: [
                    {
                        url: "/og-image.png",
                        width: 1200,
                        height: 630,
                        alt: `${name}'s Developer Portfolio`,
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                title: `${name} - ${title}`,
                description: metaDescription,
                images: ["/og-image.png"],
            },
            robots: {
                index: true,
                follow: true,
            },
            alternates: {
                canonical: `/${username}`,
            },
        };
    } catch (error) {
        console.error("[Portfolio Metadata] Error:", error);
        return {
            title: `${username} - Portfolio | ConsoleCV`,
            description: `View ${username}'s developer portfolio on ConsoleCV.`,
        };
    }
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function PortfolioPage({ params }: PageProps) {
    const { username } = await params;

    // The actual portfolio rendering is handled by the client component
    // We pass the username and let the client fetch and render
    return <PortfolioClient username={username} />;
}

"use client";

// ConsoleCV - PDF Preview Wrapper Component
// Client-side wrapper for @react-pdf/renderer PDFViewer
// Supports dynamic template switching via the Template Registry

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Download } from "lucide-react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
    Font,
    PDFViewer,
    PDFDownloadLink,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";
import { getTemplate } from "@/components/templates";

// =============================================================================
// FONT CONFIGURATION
// =============================================================================

// Register hyphenation callback for better text wrapping
Font.registerHyphenationCallback((word) => [word]);

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    page: {
        fontFamily: "Times-Roman",
        fontSize: 10,
        paddingTop: 36,
        paddingBottom: 36,
        paddingHorizontal: 48,
        lineHeight: 1.3,
        color: "#000000",
    },
    header: {
        marginBottom: 16,
        textAlign: "center",
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 1.5,
    },
    contactRow: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 4,
    },
    contactItem: {
        fontSize: 9,
        color: "#333333",
    },
    contactSeparator: {
        fontSize: 9,
        color: "#666666",
        marginHorizontal: 6,
    },
    contactLink: {
        fontSize: 9,
        color: "#000000",
        textDecoration: "none",
    },
    section: {
        marginBottom: 12,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
        paddingBottom: 2,
        borderBottomWidth: 1,
        borderBottomColor: "#000000",
        borderBottomStyle: "solid",
    },
    sectionContent: {
        paddingTop: 4,
    },
    entry: {
        marginBottom: 8,
    },
    entryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 2,
    },
    entryLeft: {
        flex: 1,
        paddingRight: 8,
    },
    entryTitle: {
        fontSize: 10,
        fontWeight: "bold",
    },
    entrySubtitle: {
        fontSize: 10,
        fontStyle: "italic",
    },
    entryDate: {
        fontSize: 9,
        color: "#333333",
        textAlign: "right",
        minWidth: 80,
    },
    bulletContainer: {
        marginTop: 2,
    },
    bulletItem: {
        flexDirection: "row",
        marginBottom: 2,
    },
    bulletPoint: {
        width: 10,
        fontSize: 9,
    },
    bulletText: {
        flex: 1,
        fontSize: 9,
        textAlign: "justify",
        lineHeight: 1.4,
    },
    projectHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 2,
        flexWrap: "wrap",
    },
    projectTitle: {
        fontSize: 10,
        fontWeight: "bold",
    },
    projectTech: {
        fontSize: 9,
        fontStyle: "italic",
        marginLeft: 6,
    },
    projectLink: {
        fontSize: 8,
        color: "#333333",
        marginLeft: 6,
        textDecoration: "none",
    },
    skillsText: {
        fontSize: 10,
    },
    emptyState: {
        textAlign: "center",
        color: "#999999",
        fontSize: 12,
        marginTop: 200,
    },
});

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const ContactSeparator = () => <Text style={styles.contactSeparator}>|</Text>;

const BulletList = ({ text }: { text: string }) => {
    const lines = text
        .split(/[\n•\-]/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length === 0) return null;

    return (
        <View style={styles.bulletContainer}>
            {lines.map((line, index) => (
                <View key={index} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                </View>
            ))}
        </View>
    );
};

// =============================================================================
// PDF DOCUMENT COMPONENT
// =============================================================================

interface ResumePdfDocumentProps {
    data: ResumeData;
}

export function ResumePdfDocument({ data }: ResumePdfDocumentProps) {
    const { personal, education, experience, projects, skills } = data;

    const hasPersonalInfo =
        personal.fullName ||
        personal.email ||
        personal.phone ||
        personal.github ||
        personal.linkedin;
    const hasEducation = education.length > 0;
    const hasExperience = experience.length > 0;
    const hasProjects = projects.length > 0;
    const hasSkills = skills.length > 0;
    const isEmpty =
        !hasPersonalInfo &&
        !hasEducation &&
        !hasExperience &&
        !hasProjects &&
        !hasSkills;

    return (
        <Document
            title={`${personal.fullName || "Resume"} - CV`}
            author={personal.fullName || "ConsoleCV"}
        >
            <Page size="A4" style={styles.page}>
                {isEmpty ? (
                    <Text style={styles.emptyState}>
                        Start filling out the form to see your resume here.
                    </Text>
                ) : (
                    <>
                        {/* Header */}
                        {hasPersonalInfo && (
                            <View style={styles.header}>
                                {personal.fullName && (
                                    <Text style={styles.name}>{personal.fullName}</Text>
                                )}
                                <View style={styles.contactRow}>
                                    {personal.email && (
                                        <Link
                                            src={`mailto:${personal.email}`}
                                            style={styles.contactLink}
                                        >
                                            <Text>{personal.email}</Text>
                                        </Link>
                                    )}
                                    {personal.email && personal.phone && <ContactSeparator />}
                                    {personal.phone && (
                                        <Text style={styles.contactItem}>{personal.phone}</Text>
                                    )}
                                    {(personal.email || personal.phone) && personal.github && (
                                        <ContactSeparator />
                                    )}
                                    {personal.github && (
                                        <Link
                                            src={`https://github.com/${personal.github}`}
                                            style={styles.contactLink}
                                        >
                                            <Text>github.com/{personal.github}</Text>
                                        </Link>
                                    )}
                                    {(personal.email || personal.phone || personal.github) &&
                                        personal.linkedin && <ContactSeparator />}
                                    {personal.linkedin && (
                                        <Link
                                            src={
                                                personal.linkedin.startsWith("http")
                                                    ? personal.linkedin
                                                    : `https://linkedin.com/in/${personal.linkedin}`
                                            }
                                            style={styles.contactLink}
                                        >
                                            <Text>LinkedIn</Text>
                                        </Link>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Education */}
                        {hasEducation && (
                            <View style={styles.section}>
                                <Text style={styles.sectionHeader}>Education</Text>
                                <View style={styles.sectionContent}>
                                    {education.map((edu, index) => (
                                        <View key={index} style={styles.entry}>
                                            <View style={styles.entryHeader}>
                                                <View style={styles.entryLeft}>
                                                    <Text style={styles.entryTitle}>{edu.school}</Text>
                                                    <Text style={styles.entrySubtitle}>{edu.degree}</Text>
                                                </View>
                                                <Text style={styles.entryDate}>
                                                    {edu.start} — {edu.end}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Experience */}
                        {hasExperience && (
                            <View style={styles.section}>
                                <Text style={styles.sectionHeader}>Experience</Text>
                                <View style={styles.sectionContent}>
                                    {experience.map((exp, index) => (
                                        <View key={index} style={styles.entry} wrap={false}>
                                            <View style={styles.entryHeader}>
                                                <View style={styles.entryLeft}>
                                                    <Text style={styles.entryTitle}>{exp.role}</Text>
                                                    <Text style={styles.entrySubtitle}>{exp.company}</Text>
                                                </View>
                                                <Text style={styles.entryDate}>
                                                    {exp.start} — {exp.end}
                                                </Text>
                                            </View>
                                            {exp.description && <BulletList text={exp.description} />}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Projects */}
                        {hasProjects && (
                            <View style={styles.section}>
                                <Text style={styles.sectionHeader}>Projects</Text>
                                <View style={styles.sectionContent}>
                                    {projects.map((project, index) => (
                                        <View key={index} style={styles.entry} wrap={false}>
                                            <View style={styles.projectHeader}>
                                                <Text style={styles.projectTitle}>{project.title}</Text>
                                                {project.techStack.length > 0 && (
                                                    <Text style={styles.projectTech}>
                                                        ({project.techStack.join(", ")})
                                                    </Text>
                                                )}
                                                {project.link && (
                                                    <Link src={project.link} style={styles.projectLink}>
                                                        <Text>[Link]</Text>
                                                    </Link>
                                                )}
                                            </View>
                                            {project.description && (
                                                <BulletList text={project.description} />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Skills */}
                        {hasSkills && (
                            <View style={styles.section}>
                                <Text style={styles.sectionHeader}>Technical Skills</Text>
                                <View style={styles.sectionContent}>
                                    <Text style={styles.skillsText}>{skills.join(" • ")}</Text>
                                </View>
                            </View>
                        )}
                    </>
                )}
            </Page>
        </Document>
    );
}

// =============================================================================
// LOADING STATE COMPONENT
// =============================================================================

function PdfLoadingState() {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900/50 rounded-lg">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Generating PDF preview...</p>
        </div>
    );
}

// =============================================================================
// PDF PREVIEW COMPONENT
// =============================================================================

interface PdfPreviewProps {
    data: ResumeData;
    className?: string;
}

export function PdfPreview({ data, className = "" }: PdfPreviewProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get the active template component based on templateId
    const TemplateComponent = useMemo(() => {
        return getTemplate(data.templateId);
    }, [data.templateId]);

    if (!isClient) {
        return <PdfLoadingState />;
    }

    return (
        <div className={`w-full h-full ${className}`}>
            <PDFViewer
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "8px",
                }}
                showToolbar={false}
            >
                <TemplateComponent data={data} />
            </PDFViewer>
        </div>
    );
}

// =============================================================================
// PDF DOWNLOAD BUTTON COMPONENT
// =============================================================================

interface PdfDownloadButtonProps {
    data: ResumeData;
    className?: string;
    children?: React.ReactNode;
}

export function PdfDownloadButton({
    data,
    className = "",
    children,
}: PdfDownloadButtonProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get the active template component based on templateId
    const TemplateComponent = useMemo(() => {
        return getTemplate(data.templateId);
    }, [data.templateId]);

    if (!isClient) {
        return (
            <button disabled className={className}>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
            </button>
        );
    }

    const fileName = `${data.personal.fullName || "Resume"}_ConsoleCV.pdf`;
    const templateSuffix = data.templateId === "modern" ? "_Modern" : "";

    return (
        <PDFDownloadLink
            document={<TemplateComponent data={data} />}
            fileName={fileName.replace(".pdf", `${templateSuffix}.pdf`)}
            className={className}
        >
            {({ loading }) =>
                loading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                    </span>
                ) : (
                    children || (
                        <span className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </span>
                    )
                )
            }
        </PDFDownloadLink>
    );
}

export default PdfPreview;

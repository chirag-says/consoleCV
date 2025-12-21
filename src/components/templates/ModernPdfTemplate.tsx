// ConsoleCV - Modern Two-Column PDF Resume Template (Deedy-Style)
// A sleek, professional template using @react-pdf/renderer
// Features a two-column layout with Helvetica sans-serif typography

import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Link,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";

// =============================================================================
// FONT REGISTRATION
// =============================================================================

// Hyphenation callback for better text wrapping
Font.registerHyphenationCallback((word) => [word]);

// =============================================================================
// COLOR PALETTE
// =============================================================================

const colors = {
    primary: "#1a1a2e",      // Dark navy for headers
    secondary: "#16213e",    // Darker navy for sidebar
    accent: "#0f3460",       // Accent blue
    text: "#1a1a2e",         // Main text
    textLight: "#4a4a68",    // Secondary text
    textMuted: "#6b6b8a",    // Muted text
    sidebarText: "#ffffff",  // White text for sidebar
    sidebarMuted: "#b8c5d6", // Muted sidebar text
    link: "#2563eb",         // Link blue
    divider: "#e2e8f0",      // Light divider
    sidebarBg: "#1e293b",    // Slate-800 background
};

// =============================================================================
// STYLE DEFINITIONS
// =============================================================================

const styles = StyleSheet.create({
    // Page Configuration
    page: {
        fontFamily: "Helvetica",
        fontSize: 9,
        lineHeight: 1.4,
        color: colors.text,
        flexDirection: "row",
    },

    // Left Sidebar (30% width)
    sidebar: {
        width: "30%",
        backgroundColor: colors.sidebarBg,
        paddingVertical: 28,
        paddingHorizontal: 16,
        minHeight: "100%",
    },

    // Right Content Area (70% width)
    content: {
        width: "70%",
        paddingVertical: 28,
        paddingHorizontal: 24,
    },

    // Header Section (Sidebar)
    headerSection: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.sidebarText,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 9,
        color: colors.sidebarMuted,
        marginTop: 4,
    },

    // Sidebar Sections
    sidebarSection: {
        marginBottom: 18,
    },
    sidebarSectionTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: colors.sidebarText,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 10,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.15)",
    },

    // Contact Info
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    contactLabel: {
        fontSize: 8,
        color: colors.sidebarMuted,
        width: 45,
    },
    contactValue: {
        fontSize: 8,
        color: colors.sidebarText,
        flex: 1,
    },
    contactLink: {
        fontSize: 8,
        color: "#60a5fa", // Light blue for links
        textDecoration: "none",
        flex: 1,
    },

    // Skills (Sidebar)
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    skillTag: {
        fontSize: 8,
        color: colors.sidebarText,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 3,
        marginBottom: 4,
        marginRight: 4,
    },

    // Education (Sidebar)
    eduEntry: {
        marginBottom: 10,
    },
    eduSchool: {
        fontSize: 9,
        fontWeight: "bold",
        color: colors.sidebarText,
        marginBottom: 2,
    },
    eduDegree: {
        fontSize: 8,
        color: colors.sidebarMuted,
        marginBottom: 1,
    },
    eduDate: {
        fontSize: 7,
        color: colors.sidebarMuted,
        fontStyle: "italic",
    },

    // Content Section Headers
    contentSection: {
        marginBottom: 16,
    },
    contentSectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: colors.primary,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 10,
        paddingBottom: 4,
        borderBottomWidth: 2,
        borderBottomColor: colors.accent,
    },

    // Experience Entry
    expEntry: {
        marginBottom: 12,
    },
    expHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    expLeft: {
        flex: 1,
        paddingRight: 8,
    },
    expRole: {
        fontSize: 10,
        fontWeight: "bold",
        color: colors.text,
    },
    expCompany: {
        fontSize: 9,
        color: colors.textLight,
        marginTop: 1,
    },
    expDate: {
        fontSize: 8,
        color: colors.textMuted,
        textAlign: "right",
        minWidth: 75,
    },

    // Bullet Points
    bulletContainer: {
        marginTop: 4,
        paddingLeft: 2,
    },
    bulletItem: {
        flexDirection: "row",
        marginBottom: 3,
    },
    bulletPoint: {
        width: 8,
        fontSize: 9,
        color: colors.accent,
    },
    bulletText: {
        flex: 1,
        fontSize: 8,
        color: colors.textLight,
        lineHeight: 1.5,
    },

    // Projects Entry
    projectEntry: {
        marginBottom: 12,
    },
    projectHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 3,
        flexWrap: "wrap",
    },
    projectTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: colors.text,
    },
    projectTech: {
        fontSize: 8,
        color: colors.textMuted,
        marginLeft: 6,
        fontStyle: "italic",
    },
    projectLink: {
        fontSize: 7,
        color: colors.link,
        marginLeft: 6,
        textDecoration: "none",
    },

    // Empty State
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

/**
 * Bullet Point List Component - handles long descriptions properly
 */
const BulletList: React.FC<{ text: string }> = ({ text }) => {
    // Split description by newlines or bullet characters to create list items
    const lines = text
        .split(/[\n•\-]/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length === 0) return null;

    return (
        <View style={styles.bulletContainer}>
            {lines.map((line, index) => (
                <View key={index} style={styles.bulletItem} wrap={false}>
                    <Text style={styles.bulletPoint}>▸</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                </View>
            ))}
        </View>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface ModernPdfTemplateProps {
    data: ResumeData;
}

const ModernPdfTemplate: React.FC<ModernPdfTemplateProps> = ({ data }) => {
    const { personal, education, experience, projects, skills } = data;

    // Check for content
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
            subject="Curriculum Vitae"
            keywords="resume, cv, curriculum vitae, modern"
        >
            <Page size="A4" style={styles.page}>
                {isEmpty ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Text style={styles.emptyState}>
                            Start filling out the form to see your resume here.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* ============================================= */}
                        {/* LEFT SIDEBAR - 30% */}
                        {/* ============================================= */}
                        <View style={styles.sidebar}>
                            {/* Header / Name */}
                            <View style={styles.headerSection}>
                                {personal.fullName && (
                                    <Text style={styles.name}>{personal.fullName}</Text>
                                )}
                                <Text style={styles.tagline}>
                                    Software Engineer • Developer
                                </Text>
                            </View>

                            {/* Contact Information */}
                            {hasPersonalInfo && (
                                <View style={styles.sidebarSection}>
                                    <Text style={styles.sidebarSectionTitle}>Contact</Text>

                                    {personal.email && (
                                        <View style={styles.contactItem}>
                                            <Text style={styles.contactLabel}>Email</Text>
                                            <Link
                                                src={`mailto:${personal.email}`}
                                                style={styles.contactLink}
                                            >
                                                {personal.email}
                                            </Link>
                                        </View>
                                    )}

                                    {personal.phone && (
                                        <View style={styles.contactItem}>
                                            <Text style={styles.contactLabel}>Phone</Text>
                                            <Text style={styles.contactValue}>{personal.phone}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Links Section */}
                            {(personal.github || personal.linkedin) && (
                                <View style={styles.sidebarSection}>
                                    <Text style={styles.sidebarSectionTitle}>Links</Text>

                                    {personal.github && (
                                        <View style={styles.contactItem}>
                                            <Text style={styles.contactLabel}>GitHub</Text>
                                            <Link
                                                src={`https://github.com/${personal.github}`}
                                                style={styles.contactLink}
                                            >
                                                {personal.github}
                                            </Link>
                                        </View>
                                    )}

                                    {personal.linkedin && (
                                        <View style={styles.contactItem}>
                                            <Text style={styles.contactLabel}>LinkedIn</Text>
                                            <Link
                                                src={
                                                    personal.linkedin.startsWith("http")
                                                        ? personal.linkedin
                                                        : `https://linkedin.com/in/${personal.linkedin}`
                                                }
                                                style={styles.contactLink}
                                            >
                                                {personal.linkedin.startsWith("http")
                                                    ? "Profile"
                                                    : personal.linkedin}
                                            </Link>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Education Section (Sidebar) */}
                            {hasEducation && (
                                <View style={styles.sidebarSection}>
                                    <Text style={styles.sidebarSectionTitle}>Education</Text>
                                    {education.map((edu, index) => (
                                        <View key={index} style={styles.eduEntry}>
                                            <Text style={styles.eduSchool}>{edu.school}</Text>
                                            <Text style={styles.eduDegree}>{edu.degree}</Text>
                                            <Text style={styles.eduDate}>
                                                {edu.start} — {edu.end}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Skills Section (Sidebar) */}
                            {hasSkills && (
                                <View style={styles.sidebarSection}>
                                    <Text style={styles.sidebarSectionTitle}>Skills</Text>
                                    <View style={styles.skillsContainer}>
                                        {skills.map((skill, index) => (
                                            <Text key={index} style={styles.skillTag}>
                                                {skill}
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* ============================================= */}
                        {/* RIGHT CONTENT - 70% */}
                        {/* ============================================= */}
                        <View style={styles.content}>
                            {/* Experience Section */}
                            {hasExperience && (
                                <View style={styles.contentSection}>
                                    <Text style={styles.contentSectionTitle}>Experience</Text>
                                    {experience.map((exp, index) => (
                                        <View key={index} style={styles.expEntry} wrap={false}>
                                            <View style={styles.expHeader}>
                                                <View style={styles.expLeft}>
                                                    <Text style={styles.expRole}>{exp.role}</Text>
                                                    <Text style={styles.expCompany}>{exp.company}</Text>
                                                </View>
                                                <Text style={styles.expDate}>
                                                    {exp.start} — {exp.end}
                                                </Text>
                                            </View>
                                            {exp.description && <BulletList text={exp.description} />}
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Projects Section */}
                            {hasProjects && (
                                <View style={styles.contentSection}>
                                    <Text style={styles.contentSectionTitle}>Projects</Text>
                                    {projects.map((project, index) => (
                                        <View key={index} style={styles.projectEntry} wrap={false}>
                                            <View style={styles.projectHeader}>
                                                <Text style={styles.projectTitle}>{project.title}</Text>
                                                {project.techStack.length > 0 && (
                                                    <Text style={styles.projectTech}>
                                                        ({project.techStack.join(", ")})
                                                    </Text>
                                                )}
                                                {project.link && (
                                                    <Link src={project.link} style={styles.projectLink}>
                                                        [View]
                                                    </Link>
                                                )}
                                            </View>
                                            {project.description && (
                                                <BulletList text={project.description} />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </>
                )}
            </Page>
        </Document>
    );
};

export default ModernPdfTemplate;

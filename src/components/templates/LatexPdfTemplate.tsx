// ConsoleCV - LaTeX-Style PDF Resume Template
// Pixel-perfect academic CV using @react-pdf/renderer
// Mimics Computer Modern / Times Roman typography for a classic LaTeX look

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

// Register Times-Roman (built-in) for the classic LaTeX look
// For true Computer Modern, you would host CMU Serif font files
Font.register({
    family: "Times-Roman",
    fonts: [
        { src: "Times-Roman" }, // Built-in PDF font
        { src: "Times-Bold", fontWeight: "bold" },
        { src: "Times-Italic", fontStyle: "italic" },
        { src: "Times-BoldItalic", fontWeight: "bold", fontStyle: "italic" },
    ],
});

// Hyphenation callback for better text wrapping
Font.registerHyphenationCallback((word) => [word]);

// =============================================================================
// STYLE DEFINITIONS
// =============================================================================

const styles = StyleSheet.create({
    // Page Configuration
    page: {
        fontFamily: "Times-Roman",
        fontSize: 10,
        paddingTop: 36,
        paddingBottom: 36,
        paddingHorizontal: 48,
        lineHeight: 1.3,
        color: "#000000",
    },

    // Header Section
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

    // Section Styling
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

    // Entry Styling (Education, Experience, Projects)
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
    entryDescription: {
        fontSize: 9,
        marginTop: 2,
        textAlign: "justify",
        lineHeight: 1.4,
    },

    // Bullet Points
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

    // Projects Section
    projectHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 2,
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

    // Skills Section
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    skillsText: {
        fontSize: 10,
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
// COMPONENT DEFINITIONS
// =============================================================================

interface LatexPdfTemplateProps {
    data: ResumeData;
}

/**
 * Section Header Component
 */
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

/**
 * Bullet Point List Component
 */
const BulletList: React.FC<{ text: string }> = ({ text }) => {
    // Split description by newlines or bullet characters to create list items
    const lines = text
        .split(/[\n•\-]/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length === 0) return null;

    // If there's only one line without bullets, show as paragraph
    if (lines.length === 1 && !text.includes("\n") && !text.includes("•")) {
        return <Text style={styles.entryDescription}>{text}</Text>;
    }

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

/**
 * Contact Info Separator
 */
const ContactSeparator: React.FC = () => (
    <Text style={styles.contactSeparator}>|</Text>
);

/**
 * Main LaTeX PDF Template Component
 */
const LatexPdfTemplate: React.FC<LatexPdfTemplateProps> = ({ data }) => {
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
            keywords="resume, cv, curriculum vitae"
        >
            <Page size="A4" style={styles.page}>
                {isEmpty ? (
                    <Text style={styles.emptyState}>
                        Start filling out the form to see your resume here.
                    </Text>
                ) : (
                    <>
                        {/* ============================================= */}
                        {/* HEADER - Personal Information */}
                        {/* ============================================= */}
                        {hasPersonalInfo && (
                            <View style={styles.header}>
                                {personal.fullName && (
                                    <Text style={styles.name}>{personal.fullName}</Text>
                                )}
                                <View style={styles.contactRow}>
                                    {personal.email && (
                                        <>
                                            <Link
                                                src={`mailto:${personal.email}`}
                                                style={styles.contactLink}
                                            >
                                                {personal.email}
                                            </Link>
                                        </>
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
                                            github.com/{personal.github}
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
                                            LinkedIn
                                        </Link>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* ============================================= */}
                        {/* EDUCATION Section */}
                        {/* ============================================= */}
                        {hasEducation && (
                            <View style={styles.section}>
                                <SectionHeader title="Education" />
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

                        {/* ============================================= */}
                        {/* EXPERIENCE Section */}
                        {/* ============================================= */}
                        {hasExperience && (
                            <View style={styles.section}>
                                <SectionHeader title="Experience" />
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

                        {/* ============================================= */}
                        {/* PROJECTS Section */}
                        {/* ============================================= */}
                        {hasProjects && (
                            <View style={styles.section}>
                                <SectionHeader title="Projects" />
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
                                                        [Link]
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

                        {/* ============================================= */}
                        {/* SKILLS Section */}
                        {/* ============================================= */}
                        {hasSkills && (
                            <View style={styles.section}>
                                <SectionHeader title="Technical Skills" />
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
};

export default LatexPdfTemplate;

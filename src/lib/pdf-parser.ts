// ConsoleCV - PDF Text Extraction Utility
// Client-side PDF parsing using pdfjs-dist loaded from CDN
// Extracts text content from uploaded PDF resumes

// =============================================================================
// TYPES
// =============================================================================

export interface PDFExtractionResult {
    success: boolean;
    text: string;
    pageCount: number;
    error?: string;
}

// =============================================================================
// PDF.JS CDN LOADER
// =============================================================================

const PDFJS_VERSION = "3.11.174";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null;
let loadingPromise: Promise<void> | null = null;

async function ensurePdfJsLoaded(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (pdfjsLib || (typeof window !== "undefined" && (window as any).pdfjsLib)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pdfjsLib = pdfjsLib || (window as any).pdfjsLib;
        return;
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${PDFJS_CDN}/pdf.min.js`;
        script.async = true;

        script.onload = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pdfjsLib = (window as any).pdfjsLib;

            if (pdfjsLib) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
                console.log("[PDF Parser] PDF.js loaded successfully, version:", PDFJS_VERSION);
                resolve();
            } else {
                reject(new Error("PDF.js failed to initialize - pdfjsLib not found on window"));
            }
        };

        script.onerror = (e) => {
            loadingPromise = null;
            console.error("[PDF Parser] Script load error:", e);
            reject(new Error("Failed to load PDF.js from CDN"));
        };

        document.head.appendChild(script);
    });

    return loadingPromise;
}

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

export async function extractTextFromPdf(file: File): Promise<PDFExtractionResult> {
    if (typeof window === "undefined") {
        return {
            success: false,
            text: "",
            pageCount: 0,
            error: "PDF extraction is only available in the browser.",
        };
    }

    console.log("[PDF Parser] Starting extraction for:", file.name, "Size:", file.size);

    try {
        // Validate file type
        if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
            return {
                success: false,
                text: "",
                pageCount: 0,
                error: "Invalid file type. Please upload a PDF file.",
            };
        }

        // Validate file size (max 10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return {
                success: false,
                text: "",
                pageCount: 0,
                error: "File too large. Maximum size is 10MB.",
            };
        }

        // Ensure PDF.js is loaded
        console.log("[PDF Parser] Loading PDF.js library...");
        await ensurePdfJsLoaded();

        if (!pdfjsLib) {
            console.error("[PDF Parser] pdfjsLib is null after loading");
            return {
                success: false,
                text: "",
                pageCount: 0,
                error: "PDF library failed to load. Please refresh and try again.",
            };
        }

        console.log("[PDF Parser] Converting file to ArrayBuffer...");
        const arrayBuffer = await file.arrayBuffer();
        console.log("[PDF Parser] ArrayBuffer size:", arrayBuffer.byteLength);

        console.log("[PDF Parser] Loading PDF document...");
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;
        console.log("[PDF Parser] PDF loaded, pages:", numPages);

        // Extract text from all pages
        const textParts: string[] = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            console.log("[PDF Parser] Extracting page", pageNum);
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();

            const pageText = textContent.items
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((item: any) => item.str || "")
                .join(" ");

            textParts.push(pageText);
            console.log("[PDF Parser] Page", pageNum, "text length:", pageText.length);
        }

        const fullText = textParts.join("\n\n").trim();
        console.log("[PDF Parser] Total extracted text length:", fullText.length);

        if (fullText.length < 50) {
            return {
                success: false,
                text: fullText,
                pageCount: numPages,
                error: "Could not extract text. This may be a scanned/image PDF.",
            };
        }

        return {
            success: true,
            text: fullText,
            pageCount: numPages,
        };
    } catch (error) {
        console.error("[PDF Parser] Error:", error);
        console.error("[PDF Parser] Error type:", typeof error);
        console.error("[PDF Parser] Error constructor:", error?.constructor?.name);

        if (error instanceof Error) {
            console.error("[PDF Parser] Error message:", error.message);
            console.error("[PDF Parser] Error stack:", error.stack);

            if (error.message.includes("encrypted") || error.message.includes("password")) {
                return {
                    success: false,
                    text: "",
                    pageCount: 0,
                    error: "This PDF is password-protected.",
                };
            }

            // Return actual error message for debugging
            return {
                success: false,
                text: "",
                pageCount: 0,
                error: `PDF error: ${error.message}`,
            };
        }

        return {
            success: false,
            text: "",
            pageCount: 0,
            error: "Failed to parse PDF. Check console for details.",
        };
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function isValidPdfFile(file: File): boolean {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

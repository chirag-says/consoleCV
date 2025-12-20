/** @type {import('next').NextConfig} */
const nextConfig = {
    // ==========================================================================
    // SECURITY HEADERS (Bank-Level Security)
    // ==========================================================================
    async headers() {
        return [
            {
                // Apply to all routes
                source: "/:path*",
                headers: [
                    // ---------- DNS & Connection Security ----------
                    {
                        key: "X-DNS-Prefetch-Control",
                        value: "on",
                    },
                    // ---------- HTTPS Enforcement (HSTS) ----------
                    // Enforces HTTPS for 2 years, includes subdomains, allows preload list
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    // ---------- Clickjacking Protection ----------
                    // Prevents the page from being embedded in iframes on other domains
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    // ---------- MIME Type Sniffing Prevention ----------
                    // Prevents browsers from MIME-sniffing a response away from declared content-type
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    // ---------- XSS Protection (Legacy Browsers) ----------
                    // Enables XSS filtering in older browsers
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    // ---------- Referrer Policy ----------
                    // Controls how much referrer information is sent
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    // ---------- Permissions Policy ----------
                    // Restricts browser features that can be used
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
                    },
                    // ---------- Content Security Policy (CSP) ----------
                    // Strict policy to prevent XSS attacks
                    // Note: 'unsafe-inline' and 'unsafe-eval' needed for Next.js development
                    // In production, consider using nonces for stricter policy
                    {
                        key: "Content-Security-Policy",
                        value: [
                            // Default: only allow from same origin
                            "default-src 'self'",
                            // Scripts: self, vercel, and inline (needed for Next.js)
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com",
                            // Styles: self and inline (needed for styled-components, etc.)
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            // Images: allow data URIs and common CDNs
                            "img-src 'self' data: blob: https:",
                            // Fonts: self and Google Fonts
                            "font-src 'self' https://fonts.gstatic.com data:",
                            // Connect: API calls
                            "connect-src 'self' https://vercel.live https://*.vercel.com wss://*.vercel.com https://vitals.vercel-insights.com",
                            // Frames: same origin and blob: (needed for @react-pdf/renderer PDFViewer)
                            "frame-src 'self' blob:",
                            // Form submissions: same origin only
                            "form-action 'self'",
                            // Base URI: same origin only
                            "base-uri 'self'",
                            // Object/embed: none (prevents Flash, etc.)
                            "object-src 'none'",
                            // Upgrade insecure requests
                            "upgrade-insecure-requests",
                        ].join("; "),
                    },
                ],
            },
        ];
    },
    // ==========================================================================
    // ADDITIONAL SECURITY SETTINGS
    // ==========================================================================
    // Disable x-powered-by header to reduce fingerprinting
    poweredByHeader: false,
};

export default nextConfig;

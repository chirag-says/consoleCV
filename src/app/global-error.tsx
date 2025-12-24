"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html lang="en">
            <body className="bg-black text-white min-h-screen flex items-center justify-center p-6">
                <div className="text-center max-w-lg">
                    <h2 className="text-3xl font-bold mb-4">Critial Error</h2>
                    <p className="text-gray-400 mb-8">
                        The application encountered a critical error and cannot continue.
                    </p>
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Try Again
                    </button>
                    <div className="mt-8 text-xs text-gray-700 font-mono">
                        {error.message}
                    </div>
                </div>
            </body>
        </html>
    );
}

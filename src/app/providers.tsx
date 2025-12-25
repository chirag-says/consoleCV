"use client";

import { SessionProvider } from "next-auth/react";
import { SoundProvider } from "@/components/ui/KeyboardSounds";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SoundProvider>
                {children}
            </SoundProvider>
        </SessionProvider>
    );
}

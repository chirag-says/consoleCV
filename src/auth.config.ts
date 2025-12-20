// ConsoleCV - NextAuth Configuration (Edge Compatible)
// Safe for middleware usage (No Mongoose/DB imports here)

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/login",
        error: "/login", // Error code passed in url string
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.name = token.name;
                session.user.email = token.email as string;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnEditor = nextUrl.pathname.startsWith("/editor");
            const isAuthRoute =
                nextUrl.pathname.startsWith("/login") ||
                nextUrl.pathname.startsWith("/register");

            if (isOnDashboard || isOnEditor) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }

            if (isAuthRoute) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            return true;
        },
    },
    providers: [], // Providers added in auth.ts
};

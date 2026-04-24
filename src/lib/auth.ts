import NextAuth from "next-auth";
import { credentialsProvider } from "@/infrastructure/auth/credentialsProvider";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [credentialsProvider],
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role;
            }
            return session;
        },
    },
});
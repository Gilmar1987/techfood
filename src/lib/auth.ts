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
                token.cpf = user.cpf;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role;
                session.user.cpf = token.cpf;
            }
            return session;
        },
    },
});
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
                token.cnpj = user.cnpj;
                token.customerId = user.customerId;
                token.supplierId = user.supplierId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role;
                session.user.cpf = token.cpf;
                session.user.cnpj = token.cnpj;
                session.user.customerId = token.customerId;
                session.user.supplierId = token.supplierId;
            }
            return session;
        },
    },
});

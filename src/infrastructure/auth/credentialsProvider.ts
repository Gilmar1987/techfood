import Credentials from "next-auth/providers/credentials";
import { AuthenticateUserUseCase } from "@/server/usecases/AuthnticateUserUseCase";

import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";

export const credentialsProvider = Credentials({
    name: "Credentials",
    credentials: {
        cpf: { label: "CPF", type: "text" },
        cnpj: { label: "CNPJ", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
    },
    async authorize(credentials: Partial<Record<"cpf" | "cnpj" | "email" | "password", unknown>>) {
        const authenticateUserUseCase = new AuthenticateUserUseCase(
            new PrismaUserRepository()
        );

        try {
            const user = await authenticateUserUseCase.execute({
                cpf: credentials?.cpf as string | undefined,
                cnpj: credentials?.cnpj as string | undefined,
                email: credentials?.email as string | undefined,
                password: credentials?.password as string
            });

            if (!user) {
                return null;
            }

            return {
                id: user.id,
                email: user.email,
                role: user.role,
                cpf: user.cpf,
                cnpj: user.cnpj,
            };
        } catch (error) {
            console.error("Error during authentication:", error);
            return null;
        }
    }
});
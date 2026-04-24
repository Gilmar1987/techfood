import { Role } from "@/domain/entities/user";
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User extends DefaultUser {
        role?: Role;
        cpf?: string;
        cnpj?: string;
    }
    interface Session extends DefaultSession {
        user: {
            role?: Role;
            cpf?: string;
            cnpj?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        role?: Role;
        cpf?: string;
        cnpj?: string;
    }
}

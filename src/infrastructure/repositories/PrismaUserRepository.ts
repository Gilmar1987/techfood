import { prisma } from "@/infrastructure/prismaClient";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { User, Role } from "@/domain/entities/user";

function toUser(u: { id: string; email: string; password: string; role: string; customer?: { cpf: string } | null; supplier?: { cnpj: string } | null }): User {
    return new User(u.id, u.email, u.password, u.customer?.cpf, u.supplier?.cnpj, u.role as Role);
}

const include = { customer: { select: { cpf: true } }, supplier: { select: { cnpj: true } } };

export class PrismaUserRepository implements UserRepository {
    async findById(id: string): Promise<User | null> {
        const u = await prisma.user.findUnique({ where: { id }, include });
        return u ? toUser(u) : null;
    }

    async findByCpforCnpj(cpf: string, cnpj: string, email?: string): Promise<User | null> {
        if (cpf) {
            const u = await prisma.user.findFirst({ where: { customer: { cpf } }, include });
            if (u) return toUser(u);
        }
        if (cnpj) {
            const u = await prisma.user.findFirst({ where: { supplier: { cnpj } }, include });
            if (u) return toUser(u);
        }
        if (email) {
            const u = await prisma.user.findUnique({ where: { email }, include });
            if (u) return toUser(u);
        }
        return null;
    }

    async create(user: User, customerId?: string, supplierId?: string): Promise<void> {
        await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                password: user.password,
                role: user.role,
                customerId: customerId ?? null,
                supplierId: supplierId ?? null,
            },
        });
    }
}

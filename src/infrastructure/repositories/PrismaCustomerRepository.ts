import { Customer } from "@/domain/entities/Customer";
import { CustomerRepository } from "@/domain/repositories/CustomerRepository";
import { TransactionContext } from "@/domain/repositories/Transaction";
import { CustomerMapper } from "@/infrastructure/mappers/Customer.Mappers";
import { prisma } from "@/infrastructure/prismaClient";
import { dbClient } from "@/infrastructure/database/TransactionManager";
import { BusinessRuleError, NotFoundError } from "@/domain/errors";

export class PrismaCustomerRepository implements CustomerRepository {

    async findById(id: string): Promise<Customer | null> {
        const customer = await prisma.customer.findUnique({
            where: { id, deletedAt: null }
        });
        return customer ? CustomerMapper.toDomain(customer) : null;
    }

    async findByCPF(cpf: string): Promise<Customer | null> {
        const customer = await prisma.customer.findUnique({
            where: { cpf, deletedAt: null }
        });
        return customer ? CustomerMapper.toDomain(customer) : null;
    }

    async findAll(): Promise<Customer[]> {
        const prismaCustomers = await prisma.customer.findMany({ where: { deletedAt: null } });
        return prismaCustomers.map(CustomerMapper.toDomain);
    }

    // Nome não é chave: dois clientes podem se chamar "João Silva".
    // A unicidade real é e-mail e CPF, que são `@unique` no schema.
    async create(customer: Customer, tx?: TransactionContext): Promise<void> {
        const db = dbClient(tx);

        const existingCustomer = await db.customer.findFirst({
            where: { email: customer.email }
        });
        if (existingCustomer) {
            throw new BusinessRuleError("Já existe um cliente com este e-mail");
        }

        const existingCustomerByCPF = await db.customer.findFirst({
            where: { cpf: customer.cpf }
        });
        if (existingCustomerByCPF) {
            throw new BusinessRuleError("Já existe um cliente com este CPF");
        }

        await db.customer.create({ data: CustomerMapper.toPrisma(customer) });
    }

    async update(customer: Customer): Promise<void> {
        const existingCustomer = await prisma.customer.findFirst({
            where: {
                email: customer.email,
                id: { not: customer.id },
                deletedAt: null
            }
        });
        if (existingCustomer) {
            throw new BusinessRuleError("Já existe um cliente com este e-mail");
        }

        const existingCustomerByCPF = await prisma.customer.findFirst({
            where: {
                cpf: customer.cpf,
                id: { not: customer.id },
                deletedAt: null
            }
        });
        if (existingCustomerByCPF) {
            throw new BusinessRuleError("Já existe um cliente com este CPF");
        }

        const result = await prisma.customer.updateMany({
            where: { id: customer.id, deletedAt: null },
            data: CustomerMapper.toPrisma(customer)
        });
        if (result.count === 0) {
            throw new NotFoundError("Cliente não encontrado");
        }
    }

    async softDelete(id: string): Promise<void> {
        const result = await prisma.customer.updateMany({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date() }
        });
        if (result.count === 0) {
            throw new NotFoundError("Cliente não encontrado");
        }
    }
}

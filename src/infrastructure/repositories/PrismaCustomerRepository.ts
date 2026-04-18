import { Customer } from "@/domain/entities/Customer";
import { CustomerRepository } from "@/domain/repositories/CustomerRepository";

import { CustomerMapper } from "@/infrastructure/mappers/Customer.Mappers";

import { prisma } from "@/infrastructure/prismaClient";


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
        if (!prismaCustomers) {
            return [];
        }
        return prismaCustomers.map(CustomerMapper.toDomain);
    }

    async create(customer: Customer): Promise<void> {
        const existingCustomer = await prisma.customer.findFirst({
            where: { email: customer.email }
        });
        if (existingCustomer) {
            throw new Error("Customer with this email already exists");
        }
        const existingCustomerByName = await prisma.customer.findFirst({
            where: {
                nome: customer.nome,
                deletedAt: null
            }
        });
        if (existingCustomerByName) {
            throw new Error("Customer with this name already exists");
        }
        const existingCustomerByCPF = await prisma.customer.findFirst({
            where: { cpf: customer.cpf }
        });
        if (existingCustomerByCPF) {
            throw new Error("Customer with this CPF already exists");
        }
        try {

            const prismaCustomer = CustomerMapper.toPrisma(customer);
            await prisma.customer.create({ data: prismaCustomer });
        } catch (error) {
            console.error("Error creating customer:", error);
            throw new Error("Failed to create customer. Please try again.");
        }
    }

    async update(customer: Customer): Promise<void> {
        //verificar se o email do cliente é único
        const existingCustomer = await prisma.customer.findFirst({
            where: {
                email: customer.email,
                id: { not: customer.id },
                deletedAt: null
            }
        });
        if (existingCustomer) {
            throw new Error("Customer with this email already exists");
        }
        //Verificar se o nome do cliente é único
        const existingCustomerByName = await prisma.customer.findFirst({
            where: {
                nome: customer.nome,
                id: { not: customer.id },
                deletedAt: null
            }
        });
        if (existingCustomerByName) {
            throw new Error("Customer with this name already exists");
        }
        //Verificar se o cpf do cliente é único
        const existingCustomerByCPF = await prisma.customer.findFirst({
            where: {
                cpf: customer.cpf,
                id: { not: customer.id },
                deletedAt: null
            }
        });
        if (existingCustomerByCPF) {
            throw new Error("Customer with this CPF already exists");
        }

        const prismaCustomer = CustomerMapper.toPrisma(customer);
        await prisma.customer.updateMany({
            where: { id: customer.id, deletedAt: null },
            data: prismaCustomer
        });
    }

    async softDelete(id: string): Promise<void> {
        const existingCustomer = await prisma.customer.findUnique({ where: { id } });
        if (!existingCustomer || existingCustomer.deletedAt) {
            throw new Error("Customer not found");
        }
        await prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}



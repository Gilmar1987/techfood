import { Customer } from "@/domain/entities/Customer";
import { Customer as PrismaCustomer } from "@/generated/prisma/client";



export class CustomerMapper {
    static toDomain(prismaCustomer: PrismaCustomer): Customer {
        return new Customer(
            prismaCustomer.id,
            prismaCustomer.nome,
            prismaCustomer.email,
            prismaCustomer.endereco,
            prismaCustomer.cep,
            prismaCustomer.cpf,
            prismaCustomer.telefone,
            prismaCustomer.createdAt,
            prismaCustomer.updatedAt,
            prismaCustomer.deletedAt
        );
    }

    static toPrisma(customer: Customer) {
        return {
            id: customer.id,
            nome: customer.nome,
            email: customer.email,
            endereco: customer.endereco,
            cep: customer.cep,
            cpf: customer.cpf,
            telefone: customer.telefone,
        };
    }
}
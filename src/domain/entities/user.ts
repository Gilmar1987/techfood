export enum Role {
    CUSTOMER = "CUSTOMER",
    SUPPLIER = "SUPPLIER",
    ADMIN = "ADMIN"
}

/**
 * Quem está executando uma operação. Os use cases usam isto para decidir posse
 * do recurso — a identidade vem sempre da sessão, nunca do corpo da requisição.
 */
export type Actor = {
    role?: Role;
    customerId?: string;
    supplierId?: string;
};

export class User {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly password: string,
        public readonly cpf?: string,
        public readonly cnpj?: string,
        public readonly role: Role = Role.CUSTOMER,
        public readonly customerId?: string,
        public readonly supplierId?: string,
    ) {
        if (!cpf && !cnpj && role !== Role.ADMIN) {
            throw new Error("CPF or CNPJ is required");
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error("Invalid email format");
        }
    }
}
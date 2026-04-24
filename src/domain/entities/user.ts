export enum Role {
    CUSTOMER = "CUSTOMER",
    SUPPLIER = "SUPPLIER",
    ADMIN = "ADMIN" 
}

export class User {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly password: string,
        public readonly cpf?: string,
        public readonly cnpj?: string,
        public readonly role: Role = Role.CUSTOMER,
    ) {
        if (!cpf && !cnpj && role !== Role.ADMIN) {
            throw new Error("CPF or CNPJ is required");
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error("Invalid email format");
        }
    }
}
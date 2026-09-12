import { User } from "../entities/user";
import { TransactionContext } from "./Transaction";

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByCpforCnpj(cpf: string, cnpj: string, email?: string): Promise<User | null>;
    create(user: User, customerId?: string, supplierId?: string, tx?: TransactionContext): Promise<void>;
}

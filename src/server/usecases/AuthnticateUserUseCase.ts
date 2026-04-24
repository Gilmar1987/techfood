import { UserRepository } from "@/domain/repositories/UserRepository";

import bcrypt from "bcryptjs";

export class AuthenticateUserUseCase {
    constructor(private userRepository: UserRepository) {}
    async execute(input: {
        cpf?: string;
        cnpj?: string;
        email?: string;
        password: string;
    }) {
        const user = await this.userRepository.findByCpforCnpj(
            input.cpf || "",
            input.cnpj || "",
            input.email || "");

        if (!user) {
            throw new Error("User not found");
        } 
        
        const isValid = await bcrypt.compare(input.password, user.password);

        if (!isValid) {
            throw new Error("Invalid password");
        }
        return user;
    }

}
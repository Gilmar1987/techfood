import { Customer } from "@/domain/entities/Customer";
import { CustomerRepository } from "@/domain/repositories/CustomerRepository";

type CreateCustomerInput = {
  nome: string;
  email: string;
  endereco: string;
  cep: string;
  cpf: string;
};

export class CreateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(input: CreateCustomerInput) {
    const { nome, email, endereco, cep, cpf } = input;

    const customer = new Customer(
      crypto.randomUUID(),
      nome,
      email,
      endereco,
      cep,
      cpf,
      new Date(),
      new Date(),
      null
    );

    await this.customerRepository.create(customer);
    return customer;
  }
}

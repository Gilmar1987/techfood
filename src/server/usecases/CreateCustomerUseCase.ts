import { Customer } from "@/domain/entities/Customer";
import { CustomerRepository } from "@/domain/repositories/CustomerRepository";

type CreateCustomerInput = {
  nome: string;
  email: string;
  endereco: string;
  cep: string;
  cpf: string;
  telefone: string;
};

export class CreateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(input: CreateCustomerInput): Promise<Customer> {
    const { nome, email, endereco, cep, cpf, telefone } = input;

    const customer = new Customer(
      crypto.randomUUID(),
      nome,
      email,
      endereco,
      cep,
      cpf,
      telefone,
      
      new Date(),
      new Date(),
      null
    );

    await this.customerRepository.create(customer);
    return customer;
  }
}

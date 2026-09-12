import { Customer } from "@/domain/entities/Customer";
import { CustomerRepository } from "@/domain/repositories/CustomerRepository";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { TransactionManager } from "@/domain/repositories/Transaction";
import { User, Role } from "@/domain/entities/user";
import bcrypt from "bcryptjs";

type CreateCustomerInput = {
  nome: string;
  email: string;
  endereco: string;
  cep: string;
  cpf: string;
  telefone: string;
  password: string;
};

export class CreateCustomerUseCase {
  constructor(
    private customerRepository: CustomerRepository,
    private userRepository: UserRepository,
    private transactionManager: TransactionManager
  ) {}

  async execute(input: CreateCustomerInput): Promise<Customer> {
    const { nome, email, endereco, cep, cpf, telefone, password } = input;

    const customerId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer(customerId, nome, email, endereco, cep, cpf, telefone, new Date(), new Date(), null);
    const user = new User(userId, email, hashedPassword, cpf, undefined, Role.CUSTOMER);

    // O `tx` precisa chegar aos repositórios: sem isso as duas escritas rodam
    // fora da transação e um erro no User deixaria o Customer órfão, sem login.
    await this.transactionManager.execute(async (tx) => {
      await this.customerRepository.create(customer, tx);
      await this.userRepository.create(user, customerId, undefined, tx);
    });

    return customer;
  }
}

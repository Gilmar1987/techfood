import { Supplier } from "@/domain/entities/Supplier";
import { SupplierRepository } from "@/domain/repositories/SupplierRepository";

type CreateSupplierInput = {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  latitude: number;
  longitude: number;
};

export class CreateSupplierUseCase {
  constructor(private supplierRepository: SupplierRepository) {}

  async execute(input: CreateSupplierInput): Promise<Supplier> {
    const { razaoSocial, cnpj, endereco, telefone, email, latitude, longitude } = input;

    const supplier = new Supplier(
      crypto.randomUUID(),
      razaoSocial,
      cnpj,
      endereco,
      telefone,
      email,
      latitude,
      longitude,
      new Date(),
      new Date(),
      null
    );

    await this.supplierRepository.create(supplier);
    return supplier;
  }
}

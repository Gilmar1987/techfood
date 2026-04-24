import { Supplier } from "@/domain/entities/Supplier";
import { SupplierRepository } from "@/domain/repositories/SupplierRepository";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { User, Role } from "@/domain/entities/user";
import { GeolocalizacaoRepository } from "@/infrastructure/repositories/GeolocalizacaoRepository";
import { CepService } from "@/infrastructure/services/CepService";
import { TransactionManager } from "@/infrastructure/database/TransactionManager";
import bcrypt from "bcryptjs";

type CreateSupplierInput = {
  razaoSocial: string;
  cnpj: string;
  cep: string;
  endereco: string;
  telefone: string;
  email: string;
  password: string;
  latitude?: number;
  longitude?: number;
};

export class CreateSupplierUseCase {
  constructor(
    private supplierRepository: SupplierRepository,
    private userRepository: UserRepository,
    private geoRepo: GeolocalizacaoRepository,
    private cepService: CepService,
    private transactionManager: TransactionManager
  ) {}

  async execute(input: CreateSupplierInput): Promise<Supplier> {
    const { razaoSocial, cnpj, cep, endereco, telefone, email, password } = input;
    const cleanCep = cep.replace(/\D/g, "");

    let latitude = input.latitude ?? 0;
    let longitude = input.longitude ?? 0;

    const cached = await this.geoRepo.findByCep(cleanCep);
    if (cached) {
      latitude = cached.latitude;
      longitude = cached.longitude;
    } else {
      try {
        const cepData = await this.cepService.getCepData(cleanCep);
        const coords = this.cepService.getCoordinates(cepData);
        if (coords) {
          latitude = coords.latitude;
          longitude = coords.longitude;
          await this.geoRepo.save(cleanCep, latitude, longitude);
        }
      } catch { /* fallback para coordenadas manuais */ }
    }

    const supplierId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    const supplier = new Supplier(supplierId, razaoSocial, cnpj, cep, endereco, telefone, email, latitude, longitude, new Date(), new Date(), null);
    const user = new User(userId, email, hashedPassword, undefined, cnpj, Role.SUPPLIER);

    await this.transactionManager.execute(async () => {
      await this.supplierRepository.create(supplier);
      await this.userRepository.create(user, undefined, supplierId);
    });

    return supplier;
  }
}

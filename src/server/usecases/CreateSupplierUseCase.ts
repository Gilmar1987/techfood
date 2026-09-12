import { Supplier } from "@/domain/entities/Supplier";
import { SupplierRepository } from "@/domain/repositories/SupplierRepository";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { TransactionManager } from "@/domain/repositories/Transaction";
import { User, Role } from "@/domain/entities/user";
import { BusinessRuleError } from "@/domain/errors";
import { GeolocalizacaoRepository } from "@/infrastructure/repositories/GeolocalizacaoRepository";
import { CepService } from "@/infrastructure/services/CepService";
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

    const coords = await this.resolveCoordenadas(cleanCep, input.latitude, input.longitude);

    const supplierId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    const supplier = new Supplier(
      supplierId, razaoSocial, cnpj, cep, endereco, telefone, email,
      coords.latitude, coords.longitude, new Date(), new Date(), null
    );
    const user = new User(userId, email, hashedPassword, undefined, cnpj, Role.SUPPLIER);

    await this.transactionManager.execute(async (tx) => {
      await this.supplierRepository.create(supplier, tx);
      await this.userRepository.create(user, undefined, supplierId, tx);
    });

    return supplier;
  }

  /**
   * Coordenada é obrigatória: o frete é calculado por distância até o fornecedor.
   * Cair no antigo default (0, 0) colocava o fornecedor no Golfo da Guiné e
   * produzia frete nacional para toda entrega.
   */
  private async resolveCoordenadas(
    cleanCep: string,
    latitude?: number,
    longitude?: number
  ): Promise<{ latitude: number; longitude: number }> {
    const cached = await this.geoRepo.findByCep(cleanCep);
    if (cached) return cached;

    try {
      const cepData = await this.cepService.getCepData(cleanCep);
      const coords = this.cepService.getCoordinates(cepData);
      if (coords) {
        await this.geoRepo.save(cleanCep, coords.latitude, coords.longitude);
        return coords;
      }
    } catch {
      // Cai para as coordenadas informadas manualmente.
    }

    if (
      latitude !== undefined && longitude !== undefined &&
      Number.isFinite(latitude) && Number.isFinite(longitude) &&
      !(latitude === 0 && longitude === 0)
    ) {
      return { latitude, longitude };
    }

    throw new BusinessRuleError(
      "Não foi possível obter as coordenadas do CEP. Informe latitude e longitude manualmente."
    );
  }
}

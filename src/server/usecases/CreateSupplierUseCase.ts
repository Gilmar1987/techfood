import { Supplier } from "@/domain/entities/Supplier";
import { SupplierRepository } from "@/domain/repositories/SupplierRepository";
import { GeolocalizacaoRepository } from "@/infrastructure/repositories/GeolocalizacaoRepository";
import { CepService } from "@/infrastructure/services/CepService";

type CreateSupplierInput = {
  razaoSocial: string;
  cnpj: string;
  cep: string;
  endereco: string;
  telefone: string;
  email: string;
  latitude?: number;
  longitude?: number;
};

export class CreateSupplierUseCase {
  constructor(
    private supplierRepository: SupplierRepository,
    private geoRepo: GeolocalizacaoRepository,
    private cepService: CepService
  ) {}

  async execute(input: CreateSupplierInput): Promise<Supplier> {
    const { razaoSocial, cnpj, cep, endereco, telefone, email } = input;
    const cleanCep = cep.replace(/\D/g, "");

    let latitude = input.latitude ?? 0;
    let longitude = input.longitude ?? 0;

    // 1. Buscar no cache do banco
    const cached = await this.geoRepo.findByCep(cleanCep);
    if (cached) {
      latitude = cached.latitude;
      longitude = cached.longitude;
    } else {
      // 2. Buscar na API CEP Aberto
      try {
        const cepData = await this.cepService.getCepData(cleanCep);
        const coords = this.cepService.getCoordinates(cepData);
        if (coords) {
          latitude = coords.latitude;
          longitude = coords.longitude;
          await this.geoRepo.save(cleanCep, latitude, longitude);
        }
      } catch {
        // 3. Fallback: usar coordenadas manuais se fornecidas
      }
    }

    const supplier = new Supplier(
      crypto.randomUUID(),
      razaoSocial,
      cnpj,
      cep,
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

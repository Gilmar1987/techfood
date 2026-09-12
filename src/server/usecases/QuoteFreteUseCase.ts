import { FreteService, FreteResult } from "@/domain/services/FreteService";
import { SupplierRepository } from "@/domain/repositories/SupplierRepository";
import { NotFoundError, BusinessRuleError } from "@/domain/errors";
import { GeolocalizacaoRepository } from "@/infrastructure/repositories/GeolocalizacaoRepository";
import { CepService } from "@/infrastructure/services/CepService";

export type FreteQuote = Partial<FreteResult> & {
  cep: string;
  endereco: string;
  valor: number;
  semCoordenadas: boolean;
};

/**
 * Fonte única do cálculo de frete. Tanto `GET /api/frete` quanto a criação de
 * pedido passam por aqui — o valor nunca vem do cliente.
 */
export class QuoteFreteUseCase {
  constructor(
    private supplierRepository: SupplierRepository,
    private geoRepo: GeolocalizacaoRepository,
    private cepService: CepService
  ) {}

  async execute(cep: string, supplierId: string): Promise<FreteQuote> {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      throw new BusinessRuleError("CEP inválido");
    }

    const supplier = await this.supplierRepository.findById(supplierId);
    if (!supplier) {
      throw new NotFoundError("Fornecedor não encontrado");
    }

    let coords = await this.geoRepo.findByCep(cleanCep);
    let endereco = "";

    if (!coords) {
      // Cache miss — consulta a API externa e guarda para as próximas vezes.
      const cepData = await this.cepService.getCepData(cleanCep);
      endereco = this.cepService.getEnderecoFormatado(cepData);
      coords = this.cepService.getCoordinates(cepData);

      if (!coords) {
        return {
          cep: cleanCep,
          endereco,
          distanciaKm: undefined,
          valor: 0,
          prazoEstimadoDias: undefined,
          faixa: "Frete a calcular",
          semCoordenadas: true,
        };
      }

      await this.geoRepo.save(cleanCep, coords.latitude, coords.longitude);
    }

    const distanciaKm = FreteService.calcularDistanciaKm(
      coords.latitude,
      coords.longitude,
      supplier.latitude,
      supplier.longitude
    );

    return {
      cep: cleanCep,
      endereco,
      ...FreteService.calcularFrete(distanciaKm),
      semCoordenadas: false,
    };
  }

  /** Só o valor, para uso no fechamento do pedido. Falha de CEP não bloqueia a compra. */
  async valorPara(cep: string, supplierId: string): Promise<number> {
    try {
      const quote = await this.execute(cep, supplierId);
      return quote.valor;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      // API de CEP fora do ar ou CEP sem coordenadas: pedido segue com frete a combinar.
      console.error("Falha ao calcular frete, assumindo 0:", error);
      return 0;
    }
  }
}

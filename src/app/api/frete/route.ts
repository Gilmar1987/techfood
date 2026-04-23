import { NextResponse } from "next/server";
import { CepService } from "@/infrastructure/services/CepService";
import { FreteService } from "@/domain/services/FreteService";
import { supplierRepository } from "@/server/container";
import { GeolocalizacaoRepository } from "@/infrastructure/repositories/GeolocalizacaoRepository";

const cepService = new CepService();
const geoRepo = new GeolocalizacaoRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cep = searchParams.get("cep")?.replace(/\D/g, "") ?? "";
    const supplierId = searchParams.get("supplierId")?.trim() ?? "";

    if (cep.length !== 8) {
      return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
    }
    if (!supplierId) {
      return NextResponse.json({ error: "supplierId é obrigatório" }, { status: 400 });
    }

    const supplier = await supplierRepository.findById(supplierId);
    if (!supplier) {
      return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
    }

    // 1. Buscar no cache do banco
    let coords = await geoRepo.findByCep(cep);
    let endereco = "";

    if (coords) {
      // Cache hit — não chama a API externa
      console.log(`[Geo] Cache hit para CEP ${cep}`);
    } else {
      // Cache miss — busca na API externa
      console.log(`[Geo] Cache miss para CEP ${cep} — consultando API`);
      const cepData = await cepService.getCepData(cep);
      endereco = cepService.getEnderecoFormatado(cepData);
      coords = cepService.getCoordinates(cepData);

      if (!coords) {
        return NextResponse.json({
          cep,
          endereco,
          distanciaKm: null,
          valor: 0,
          prazoEstimadoDias: null,
          faixa: "Frete a calcular",
          semCoordenadas: true,
        }, { status: 200 });
      }

      // Salvar no cache para próximas consultas
      await geoRepo.save(cep, coords.latitude, coords.longitude);
    }

    const distanciaKm = FreteService.calcularDistanciaKm(
      coords.latitude, coords.longitude,
      supplier.latitude, supplier.longitude
    );

    const frete = FreteService.calcularFrete(distanciaKm);

    return NextResponse.json({ cep, endereco, ...frete, semCoordenadas: false }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao calcular frete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

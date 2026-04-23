import { NextResponse } from "next/server";
import { CepService } from "@/infrastructure/services/CepService";
import { FreteService } from "@/domain/services/FreteService";
import { supplierRepository } from "@/server/container";

const cepService = new CepService();

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

    const cepData = await cepService.getCepData(cep);
    const endereco = cepService.getEnderecoFormatado(cepData);
    const coords = cepService.getCoordinates(cepData);

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

    const distanciaKm = FreteService.calcularDistanciaKm(
      coords.lat, coords.lon,
      supplier.latitude, supplier.longitude
    );

    const frete = FreteService.calcularFrete(distanciaKm);

    return NextResponse.json({ cep, endereco, ...frete, semCoordenadas: false }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao calcular frete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

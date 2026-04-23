import { NextResponse } from "next/server";
import { GeolocalizacaoRepository } from "@/infrastructure/repositories/GeolocalizacaoRepository";
import { CepService } from "@/infrastructure/services/CepService";

const geoRepo = new GeolocalizacaoRepository();
const cepService = new CepService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cep = searchParams.get("cep")?.replace(/\D/g, "") ?? "";

    if (cep.length !== 8) {
      return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
    }

    // 1. Cache no banco
    const cached = await geoRepo.findByCep(cep);
    if (cached) {
      return NextResponse.json({ latitude: cached.latitude, longitude: cached.longitude, source: "cache" }, { status: 200 });
    }

    // 2. API CEP Aberto
    const cepData = await cepService.getCepData(cep);
    const coords = cepService.getCoordinates(cepData);

    if (!coords) {
      return NextResponse.json({ error: "Coordenadas não disponíveis para este CEP" }, { status: 404 });
    }

    // Salvar no cache
    await geoRepo.save(cep, coords.latitude, coords.longitude);

    return NextResponse.json({ latitude: coords.latitude, longitude: coords.longitude, source: "api" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar geolocalização";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

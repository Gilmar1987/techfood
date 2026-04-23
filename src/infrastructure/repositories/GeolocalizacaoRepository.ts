import { prisma } from "@/infrastructure/prismaClient";

export class GeolocalizacaoRepository {
  async findByCep(cep: string): Promise<{ latitude: number; longitude: number } | null> {
    const geo = await prisma.geolocalizacao.findUnique({ where: { cep } });
    if (!geo) return null;
    return { latitude: geo.latitude, longitude: geo.longitude };
  }

  async save(cep: string, latitude: number, longitude: number): Promise<void> {
    await prisma.geolocalizacao.upsert({
      where: { cep },
      update: { latitude, longitude },
      create: { cep, latitude, longitude },
    });
  }
}

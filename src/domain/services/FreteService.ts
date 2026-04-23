export type FreteResult = {
  distanciaKm: number;
  valor: number;
  prazoEstimadoDias: number;
  faixa: string;
};

export class FreteService {
  private static readonly TAXA_POR_KM = 0.5;
  private static readonly FRETE_MINIMO = 5.0;
  private static readonly FRETE_GRATIS_ACIMA_KM = 0;

  static calcularDistanciaKm(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  static calcularFrete(distanciaKm: number): FreteResult {
    const distancia = Math.round(distanciaKm * 10) / 10;
    let valor: number;
    let prazoEstimadoDias: number;
    let faixa: string;

    if (distancia <= 10) {
      valor = this.FRETE_MINIMO;
      prazoEstimadoDias = 1;
      faixa = "Local (até 10km)";
    } else if (distancia <= 50) {
      valor = Math.max(this.FRETE_MINIMO, distancia * this.TAXA_POR_KM);
      prazoEstimadoDias = 2;
      faixa = "Regional (10–50km)";
    } else if (distancia <= 200) {
      valor = Math.max(this.FRETE_MINIMO, distancia * this.TAXA_POR_KM * 0.9);
      prazoEstimadoDias = 3;
      faixa = "Estadual (50–200km)";
    } else {
      valor = Math.max(this.FRETE_MINIMO, distancia * this.TAXA_POR_KM * 0.8);
      prazoEstimadoDias = 5;
      faixa = "Nacional (acima de 200km)";
    }

    return {
      distanciaKm: distancia,
      valor: Math.round(valor * 100) / 100,
      prazoEstimadoDias,
      faixa,
    };
  }

  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

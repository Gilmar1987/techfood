export type CepData = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  } | null;
};

export class CepService {
  async getCepData(cep: string): Promise<CepData> {
    const cleanCep = cep.replace(/\D/g, "");

    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);

    if (!res.ok) {
      throw new Error("CEP não encontrado");
    }

    return res.json();
  }

  getCoordinates(data: CepData): { lat: number; lon: number } | null {
    const lat = parseFloat(data.location?.coordinates?.latitude ?? "");
    const lon = parseFloat(data.location?.coordinates?.longitude ?? "");

    if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) return null;

    return { lat, lon };
  }

  getEnderecoFormatado(data: CepData): string {
    return [data.street, data.neighborhood, data.city, data.state]
      .filter(Boolean)
      .join(", ");
  }
}

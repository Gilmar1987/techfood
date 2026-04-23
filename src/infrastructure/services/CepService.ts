export type CepData = {
  cep: string;
  logradouro: string;
  bairro: string;
  complemento: string;
  altitude: number;
  latitude: string;
  longitude: string;
  cidade: {
    ibge: string;
    nome: string;
    ddd: number;
  };
  estado: {
    sigla: string;
  };
};

export class CepService {
  async getCepData(cep: string): Promise<CepData> {
    const cleanCep = cep.replace(/\D/g, "");

    const token = process.env.CEP_ABERTO_TOKEN;
    if (!token) throw new Error("CEP_ABERTO_TOKEN não configurado");

    const res = await fetch(`https://www.cepaberto.com/api/v3/cep?cep=${cleanCep}`, {
      headers: {
        Authorization: `Token token=${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Erro ao buscar CEP: ${res.status}`);
    }

    const data = await res.json();

    if (!data || !data.cep) {
      throw new Error("CEP não encontrado");
    }

    return data;
  }

  getCoordinates(data: CepData): { lat: number; lon: number } | null {
    const lat = parseFloat(data.latitude ?? "");
    const lon = parseFloat(data.longitude ?? "");

    if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) return null;

    return { lat, lon };
  }

  getEnderecoFormatado(data: CepData): string {
    return [data.logradouro, data.bairro, data.cidade?.nome, data.estado?.sigla]
      .filter(Boolean)
      .join(", ");
  }
}

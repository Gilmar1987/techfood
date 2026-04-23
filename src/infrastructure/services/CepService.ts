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

  getCoordinates(data: CepData): { latitude: number; longitude: number } | null {
    const latitude = parseFloat(data.latitude ?? "");
    const longitude = parseFloat(data.longitude ?? "");

    if (isNaN(latitude) || isNaN(longitude) || latitude === 0 || longitude === 0) return null;

    return { latitude, longitude };
  }

  getEnderecoFormatado(data: CepData): string {
    return [data.logradouro, data.bairro, data.cidade?.nome, data.estado?.sigla]
      .filter(Boolean)
      .join(", ");
  }
}

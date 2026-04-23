export class Supplier {
  constructor(
    public id: string,
    public razaoSocial: string,
    public cnpj: string,
    public endereco: string,
    public telefone: string,
    public email: string,
    public latitude: number,
    public longitude: number,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null
  ) {
    if (!this.validateRazaoSocial()) throw new Error("Razão social inválida");
    if (!this.validateCNPJ()) throw new Error("CNPJ inválido");
    if (!this.validateEmail()) throw new Error("Email inválido");
    if (!this.validateTelefone()) throw new Error("Telefone inválido");
    if (!this.validateCoordenadas()) throw new Error("Coordenadas inválidas");
  }

  validateRazaoSocial(): boolean {
    return this.razaoSocial.trim().length > 0;
  }

  validateCNPJ(): boolean {
    const cnpj = this.cnpj.replace(/[\D]/g, "");
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;

    const calc = (cnpj: string, len: number) => {
      let sum = 0;
      let pos = len - 7;
      for (let i = len; i >= 1; i--) {
        sum += parseInt(cnpj.charAt(len - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };

    return (
      calc(cnpj, 12) === parseInt(cnpj.charAt(12)) &&
      calc(cnpj, 13) === parseInt(cnpj.charAt(13))
    );
  }

  validateEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  validateTelefone(): boolean {
    const tel = this.telefone.replace(/[\D]/g, "");
    return tel.length >= 10 && tel.length <= 11;
  }

  validateCoordenadas(): boolean {
    return (
      this.latitude >= -90 && this.latitude <= 90 &&
      this.longitude >= -180 && this.longitude <= 180
    );
  }
}

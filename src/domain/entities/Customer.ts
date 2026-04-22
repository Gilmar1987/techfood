/*
model Customer{
  id          String @id @default(uuid())
  nome        String
  email       String @unique
  endereco    String
  cep         String
  cpf         String @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  orders      Order[]

  @@index([deletedAt])
}
*/

//Implementação da entidade Customer no domínio
export class Customer {
  constructor(
    public id: string,
    public nome: string,
    public email: string,
    public endereco: string,
    public cep: string,
    public cpf: string,
    public telefone: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null
  ) {
    if (!this.validateNome()) throw new Error("Invalid nome");
    if (!this.validateEmail()) throw new Error("Invalid email");
    if (!this.validateCPF()) throw new Error("Invalid CPF");
    if (!this.validateCEP()) throw new Error("Invalid CEP");
    if (!this.validateTelefone()) throw new Error("Invalid telefone");
  }

  // Métodos relacionados ao cliente podem ser adicionados aqui, como validação de CPF, atualização de endereço, etc.
  //Validar CPF
  validateCPF(): boolean {
    // Implementação de validação de CPF (simplificada)
    const cpf = this.cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (cpf.length !== 11) return false; // CPF deve ter 11 dígitos 

    // Verificar se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Cálculo dos dígitos verificadores
    const calculateCheckDigit = (cpf: string, factor: number): number => {
      let total = 0;
      for (let i = 0; i < factor - 1; i++) {
        total += parseInt(cpf.charAt(i)) * (factor - i);
      }
      const remainder = total % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const digit1 = calculateCheckDigit(cpf, 10);
    if (parseInt(cpf.charAt(9)) !== digit1) return false;
    const digit2 = calculateCheckDigit(cpf, 11);
    if (parseInt(cpf.charAt(10)) !== digit2) return false;
    return true;
  }
   // Verificar cpf unico
   



  //Validar email
  validateEmail(): boolean {
    // Implementação de validação de email (simplificada)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
  //Validar CEP
    validateCEP(): boolean {
    // Implementação de validação de CEP (simplificada)
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(this.cep);
  }
  //Validar nome
  validateNome(): boolean {
    return this.nome.trim().length > 0;
  }

  validateTelefone(): boolean {
    const tel = this.telefone.replace(/[^\d]/g, "");
    return tel.length >= 10 && tel.length <= 11;
  }
}
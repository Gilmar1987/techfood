/** Recurso inexistente — ou existente, mas fora do alcance de quem pediu. */
export class NotFoundError extends Error {
  constructor(message = "Recurso não encontrado") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Violação de regra de negócio (entrada inválida, transição de estado proibida). */
export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

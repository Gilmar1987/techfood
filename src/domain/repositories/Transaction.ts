/**
 * Handle opaco de transação. O domínio apenas repassa o valor entre repositórios;
 * quem conhece o tipo concreto (`Prisma.TransactionClient`) é a infraestrutura.
 * Manter opaco impede que o Prisma vaze para dentro do domínio.
 */
export type TransactionContext = object;

/**
 * Porta de transação. A implementação concreta vive na infraestrutura
 * (`PrismaTransactionManager`); os use cases dependem apenas desta interface.
 */
export interface TransactionManager {
  execute<T>(callback: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

import { prisma } from "@/infrastructure/prismaClient";
import { Prisma } from "@/generated/prisma/client";
import {
  TransactionContext,
  TransactionManager,
} from "@/domain/repositories/Transaction";

export type { Prisma };

export class PrismaTransactionManager implements TransactionManager {
  async execute<T>(callback: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return callback(tx);
    });
  }
}

/**
 * Resolve qual client usar: o da transação quando houver, senão o global.
 * É aqui que o handle opaco do domínio volta a ser um client do Prisma.
 */
export function dbClient(tx?: TransactionContext): Prisma.TransactionClient {
  return (tx as Prisma.TransactionClient | undefined) ?? prisma;
}

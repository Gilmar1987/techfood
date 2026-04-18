import { prisma } from "@/infrastructure/prismaClient";
import { Prisma } from "@/generated/prisma/client";

export type { Prisma };

export class TransactionManager {
  async execute<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return callback(tx);
    });
  }
}

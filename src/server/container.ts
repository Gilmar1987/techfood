// injerction dependency

import { PrismaProductRepository } from '@/infrastructure/repositories/PrismaProductctRepository';
import { PrismaOrderRepository } from '../infrastructure/repositories/PrismaOrderRepository';
import { PrismaCustomerRepository } from '../infrastructure/repositories/PrismaCustomerRepository';
import { CreateOrderUseCase } from "@/server/usecases/CreateOrderUseCase";
import { prisma } from '@/infrastructure/prismaClient';
import { PrismaOrderItemRepository } from '@/infrastructure/repositories/PrismaOrderItemRepository';

function makeContainer() {
  const orderItemRepository = new PrismaOrderItemRepository(prisma);
  const productRepository = new PrismaProductRepository();
  const orderRepository = new PrismaOrderRepository(prisma, orderItemRepository);
  const customerRepository = new PrismaCustomerRepository();
  const createOrderUseCase = new CreateOrderUseCase(productRepository, orderRepository, customerRepository);
  return { productRepository, createOrderUseCase };
}

const container = makeContainer();
export const productRepository = container.productRepository;
export const createOrderUseCase = container.createOrderUseCase;

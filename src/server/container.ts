// injerction dependency

import { PrismaProductRepository } from '@/infrastructure/repositories/PrismaProductctRepository';
import { PrismaOrderRepository } from '../infrastructure/repositories/PrismaOrderRepository';
import { PrismaCustomerRepository } from '../infrastructure/repositories/PrismaCustomerRepository';
import {CreateOrderUseCase} from "@/server/usecases/CreateOrderUseCase";
import { PrismaClient } from '@prisma/client';
import { PrismaOrderItemRepository } from '@/infrastructure/repositories/PrismaOrderItemRepository';




const prisma = new PrismaClient();
const orderItemRepository = new PrismaOrderItemRepository(prisma);

const productRepository = new PrismaProductRepository();
const orderRepository = new PrismaOrderRepository(prisma, orderItemRepository);
const customerRepository = new PrismaCustomerRepository();


export const createOrderUseCase = new CreateOrderUseCase(orderRepository, productRepository, customerRepository);

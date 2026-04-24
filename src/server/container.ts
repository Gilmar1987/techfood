// injerction dependency

import { PrismaProductRepository } from '@/infrastructure/repositories/PrismaProductctRepository';
import { PrismaOrderRepository } from '../infrastructure/repositories/PrismaOrderRepository';
import { PrismaCustomerRepository } from '../infrastructure/repositories/PrismaCustomerRepository';
import { PrismaSupplierRepository } from '@/infrastructure/repositories/PrismaSupplierRepository';
import { CreateOrderUseCase } from "@/server/usecases/CreateOrderUseCase";
import { prisma } from '@/infrastructure/prismaClient';
import { PrismaOrderItemRepository } from '@/infrastructure/repositories/PrismaOrderItemRepository';
import { CreateProductUseCase } from '@/server/usecases/CreateProductUseCase';
import { CreateCustomerUseCase } from '@/server/usecases/CreateCustomerUseCase';
import { CreateSupplierUseCase } from '@/server/usecases/CreateSupplierUseCase';
import { PayOrderUseCase } from '@/server/usecases/PayOrderUseCase';
import { UpdateOrderStatusUseCase } from '@/server/usecases/UpdateOrderStatusUseCase';
import { TransactionManager } from '@/infrastructure/database/TransactionManager';
import { GeolocalizacaoRepository } from '@/infrastructure/repositories/GeolocalizacaoRepository';
import { CepService } from '@/infrastructure/services/CepService';
import { PrismaUserRepository } from '@/infrastructure/repositories/PrismaUserRepository';

function makeContainer() {
  const orderItemRepository = new PrismaOrderItemRepository(prisma);
  const productRepository = new PrismaProductRepository();
  const orderRepository = new PrismaOrderRepository(prisma, orderItemRepository);
  const customerRepository = new PrismaCustomerRepository();
  const supplierRepository = new PrismaSupplierRepository();
  const userRepository = new PrismaUserRepository();
  const transactionManager = new TransactionManager();
  const geoRepo = new GeolocalizacaoRepository();
  const cepService = new CepService();
  const createOrderUseCase = new CreateOrderUseCase(productRepository, orderRepository, customerRepository, transactionManager);

  return { productRepository, orderRepository, customerRepository, supplierRepository, userRepository, createOrderUseCase, geoRepo, cepService, transactionManager };
}

const container = makeContainer();
export const productRepository = container.productRepository;
export const orderRepository = container.orderRepository;
export const customerRepository = container.customerRepository;
export const supplierRepository = container.supplierRepository;
export const userRepository = container.userRepository;
export const createOrderUseCase = container.createOrderUseCase;

export const createProductUseCase = new CreateProductUseCase(productRepository);
export const createCustomerUseCase = new CreateCustomerUseCase(customerRepository, container.userRepository, container.transactionManager);
export const createSupplierUseCase = new CreateSupplierUseCase(supplierRepository, container.userRepository, container.geoRepo, container.cepService, container.transactionManager);
export const payOrderUseCase = new PayOrderUseCase(orderRepository);
export const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository, container.productRepository, new TransactionManager());
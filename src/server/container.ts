// Injeção de dependências: um único ponto de montagem do grafo de objetos.

import { PrismaProductRepository } from '@/infrastructure/repositories/PrismaProductctRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/PrismaOrderRepository';
import { PrismaCustomerRepository } from '@/infrastructure/repositories/PrismaCustomerRepository';
import { PrismaSupplierRepository } from '@/infrastructure/repositories/PrismaSupplierRepository';
import { PrismaOrderItemRepository } from '@/infrastructure/repositories/PrismaOrderItemRepository';
import { PrismaUserRepository } from '@/infrastructure/repositories/PrismaUserRepository';
import { PrismaTransactionManager } from '@/infrastructure/database/TransactionManager';
import { GeolocalizacaoRepository } from '@/infrastructure/repositories/GeolocalizacaoRepository';
import { CepService } from '@/infrastructure/services/CepService';
import { prisma } from '@/infrastructure/prismaClient';

import { CreateOrderUseCase } from '@/server/usecases/CreateOrderUseCase';
import { CreateProductUseCase } from '@/server/usecases/CreateProductUseCase';
import { CreateCustomerUseCase } from '@/server/usecases/CreateCustomerUseCase';
import { CreateSupplierUseCase } from '@/server/usecases/CreateSupplierUseCase';
import { PayOrderUseCase } from '@/server/usecases/PayOrderUseCase';
import { UpdateOrderStatusUseCase } from '@/server/usecases/UpdateOrderStatusUseCase';
import { QuoteFreteUseCase } from '@/server/usecases/QuoteFreteUseCase';

function makeContainer() {
  const orderItemRepository = new PrismaOrderItemRepository(prisma);
  const productRepository = new PrismaProductRepository();
  const orderRepository = new PrismaOrderRepository(prisma, orderItemRepository);
  const customerRepository = new PrismaCustomerRepository();
  const supplierRepository = new PrismaSupplierRepository();
  const userRepository = new PrismaUserRepository();
  const transactionManager = new PrismaTransactionManager();
  const geoRepo = new GeolocalizacaoRepository();
  const cepService = new CepService();

  const quoteFreteUseCase = new QuoteFreteUseCase(supplierRepository, geoRepo, cepService);

  return {
    productRepository,
    orderRepository,
    customerRepository,
    supplierRepository,
    userRepository,
    geoRepo,
    cepService,
    transactionManager,
    quoteFreteUseCase,
    createOrderUseCase: new CreateOrderUseCase(
      productRepository, orderRepository, customerRepository, transactionManager, quoteFreteUseCase
    ),
    createProductUseCase: new CreateProductUseCase(productRepository),
    createCustomerUseCase: new CreateCustomerUseCase(
      customerRepository, userRepository, transactionManager
    ),
    createSupplierUseCase: new CreateSupplierUseCase(
      supplierRepository, userRepository, geoRepo, cepService, transactionManager
    ),
    payOrderUseCase: new PayOrderUseCase(orderRepository),
    updateOrderStatusUseCase: new UpdateOrderStatusUseCase(
      orderRepository, productRepository, transactionManager
    ),
  };
}

const container = makeContainer();

export const productRepository = container.productRepository;
export const orderRepository = container.orderRepository;
export const customerRepository = container.customerRepository;
export const supplierRepository = container.supplierRepository;
export const userRepository = container.userRepository;
export const createOrderUseCase = container.createOrderUseCase;
export const createProductUseCase = container.createProductUseCase;
export const createCustomerUseCase = container.createCustomerUseCase;
export const createSupplierUseCase = container.createSupplierUseCase;
export const payOrderUseCase = container.payOrderUseCase;
export const updateOrderStatusUseCase = container.updateOrderStatusUseCase;
export const quoteFreteUseCase = container.quoteFreteUseCase;

import {Order} from "../../domain/entities/Order";
import { OrderItem } from "@/generated/prisma";
import { OrderStatus } from "@/domain/enums/OrderStatus";

export class CreateOrderUseCase {
    constructor(
        private productRepository,
        private orderRepository,
        private customerRepository
    ) {}

    async execute(input) {
        const { customerId, items } = input;

        const customer = await this.customerRepository.findById(customerId);

        if (!customer) {
            throw new Error('Customer not found');
        }

        const products = await this.productRepository.findByIds(items.map(i => i.productId));

        if (products.length !== items.length) {
            throw new Error('One or more products not found');
        }

        const order = new Order(
            crypto.randomUUID(),
            0,
            OrderStatus.PENDING,
            customerId,
            new Date(),
            new Date()
            
            
        );
    }    for (result item of items) {
            const product = products.find(p => p.id === item.productId);

            if (!product) {
                throw new Error(`Product with id ${item.productId} not found`);
            }

            order.addItem(new OrderItem(
                product.id,
                item.quantity,
                Number(product.precoUnitario),
            ));
        }

        order.validate(); 

        for(const item of order.getItems()) {
            await this.productRepository.descrementStock(item.productId, item.quantity);
        }

        await this.orderRepository.create(order);

        return order;
}
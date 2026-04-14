import { Order } from "@/domain/entities/Order";
import { OrderStatus } from "@/domain/enums/OrderStatus";
import { OrderItemMapper } from "@/infrastructure/mappers/OrderItem.Mappers";
import { OrderItem} from "@/domain/entities/OrderItem";
import { create } from "domain";

export class OrderMapper {
    static toPrisma(order: Order) {
        return {
            id: order.id,
            total: order.total,
            status: order.status,
            customerId: order.customerId,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            deletedAt: order.deletedAt,
            items: {
              create : order.getItems().map(item => ({
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                quantidade: item.quantity,
                precoUnitario: item.precoUnitario,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                deletedAt: item.deletedAt
              }))

            }
            
        };
    }

    static toDomain(order: any): Order {
        return new Order(
            order.id,
            Number(order.total),
            order.status as OrderStatus,
            order.customerId,
            order.createdAt,
            order.updatedAt,
            order.deletedAt,
            order.items ? order.items.map((item: any) => OrderItemMapper.toDomain(item)) : []
        );
    }
}
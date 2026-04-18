import { orderRepository } from "@/server/container";
import { Order } from "@/domain/entities/Order";

export default async function OrdersPage() {
  const orders = await orderRepository.findAll();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-black dark:text-white mb-8">
          Pedidos
        </h1>

        {orders.length === 0 ? (
          <p className="text-zinc-500">Nenhum pedido encontrado.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order: Order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-zinc-400 font-mono">{order.id}</span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {order.statusOrder}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Cliente: <span className="font-medium text-black dark:text-white">{order.customerId}</span></span>
                  <span>Total: <span className="font-semibold text-black dark:text-white">R$ {Number(order.total).toFixed(2)}</span></span>
                </div>

                {order.getItems().length > 0 && (
                  <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <p className="text-xs text-zinc-400 mb-2">Itens</p>
                    <div className="flex flex-col gap-1">
                      {order.getItems().map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            {item.quantidade}x {item.product.nome}
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-200">
                            R$ {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-zinc-400 mt-4">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString("pt-BR") : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

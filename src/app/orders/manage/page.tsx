"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderItem = { id: string; quantidade: number; precoUnitario: number; product: { nome: string } };
type OrderData = {
  id: string;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  frete: number;
  total: number;
  createdAt: string;
  customer: { nome: string } | null;
  customerId: string;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  PREPARING: "Preparando",
  READY: "Pronto",
  OUT_FOR_DELIVERY: "Em entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  PAID: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  PREPARING: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  READY: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const PAYMENT_LABELS: Record<string, string> = { PIX: "Pix", CARD: "Cartão", CASH: "Dinheiro" };

const CAN_ADVANCE: Record<string, boolean> = {
  PENDING: false,
  PAID: true,
  PREPARING: true,
  READY: true,
  OUT_FOR_DELIVERY: true,
  DELIVERED: false,
  CANCELLED: false,
};

const CAN_CANCEL: Record<string, boolean> = {
  PENDING: true,
  PAID: true,
  PREPARING: true,
  READY: true,
  OUT_FOR_DELIVERY: false,
  DELIVERED: false,
  CANCELLED: false,
};

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadOrders() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    if (res.ok) setOrders(data);
    setLoading(false);
  }

  useEffect(() => { loadOrders(); }, []);

  async function handlePay(orderId: string, paymentMethod: string) {
    setActionLoading(orderId);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, action: "pay", paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPayingOrderId(null);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar pagamento");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAdvance(orderId: string) {
    setActionLoading(orderId);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, action: "advance" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao avançar status");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(orderId: string) {
    if (!confirm("Deseja cancelar este pedido?")) return;
    setActionLoading(orderId);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar pedido");
    } finally {
      setActionLoading(null);
    }
  }

  const subtotal = (order: OrderData) =>
    order.items.reduce((s, i) => s + Number(i.precoUnitario) * i.quantidade, 0);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-black dark:text-white">Gerenciar Pedidos</h1>
          <div className="flex gap-3">
            <Link href="/orders" className="h-10 px-5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Ver Listagem
            </Link>
            <Link href="/" className="h-10 px-5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Home
            </Link>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>
        )}

        {loading ? (
          <p className="text-zinc-500">Carregando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className="text-zinc-500">Nenhum pedido encontrado.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order, index) => (
              <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-500">Pedido #{orders.length - index}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    {order.paymentMethod && (
                      <span className="text-xs text-zinc-400">
                        {PAYMENT_LABELS[order.paymentMethod]} · {order.paidAt ? new Date(order.paidAt).toLocaleString("pt-BR") : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleString("pt-BR")}</span>
                </div>

                {/* Cliente */}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Cliente: <span className="font-medium text-black dark:text-white">{order.customer?.nome ?? order.customerId}</span>
                </p>

                {/* Itens */}
                {order.items.length > 0 && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 mb-3">
                    <p className="text-xs text-zinc-400 mb-2">Itens</p>
                    <div className="flex flex-col gap-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">{item.quantidade}x {item.product.nome}</span>
                          <span className="text-zinc-800 dark:text-zinc-200">R$ {(Number(item.precoUnitario) * item.quantidade).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
                      <div className="flex justify-between text-sm text-zinc-500">
                        <span>Subtotal</span><span>R$ {subtotal(order).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-zinc-500">
                        <span>Frete</span>
                        <span>{Number(order.frete) > 0 ? `R$ ${Number(order.frete).toFixed(2)}` : "A combinar"}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-black dark:text-white">
                        <span>Total</span><span>R$ {(subtotal(order) + Number(order.frete)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">

                  {/* Pagamento — só para PENDING */}
                  {order.status === "PENDING" && (
                    payingOrderId === order.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">Método:</span>
                        {(["PIX", "CARD", "CASH"] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => handlePay(order.id, m)}
                            disabled={actionLoading === order.id}
                            className="h-8 px-3 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            {PAYMENT_LABELS[m]}
                          </button>
                        ))}
                        <button
                          onClick={() => setPayingOrderId(null)}
                          className="h-8 px-3 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPayingOrderId(order.id)}
                        className="h-8 px-4 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Registrar Pagamento
                      </button>
                    )
                  )}

                  {/* Avançar status */}
                  {CAN_ADVANCE[order.status] && (
                    <button
                      onClick={() => handleAdvance(order.id)}
                      disabled={actionLoading === order.id}
                      className="h-8 px-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === order.id ? "..." : `Avançar → ${STATUS_LABELS[order.status] === "Pago" ? "Preparando" : order.status === "PREPARING" ? "Pronto" : order.status === "READY" ? "Em entrega" : "Entregue"}`}
                    </button>
                  )}

                  {/* Cancelar */}
                  {CAN_CANCEL[order.status] && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={actionLoading === order.id}
                      className="h-8 px-4 rounded-full border border-red-200 dark:border-red-800 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-colors"
                    >
                      Cancelar Pedido
                    </button>
                  )}

                  {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
                    <span className="text-xs text-zinc-400 italic">Pedido finalizado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type OrderItem = { id: string; quantidade: number; precoUnitario: number; product: { nome: string } };
type OrderData = {
  id: string; status: string; paymentMethod: string | null; paidAt: string | null;
  frete: number; total: number; createdAt: string;
  customer: { nome: string } | null; customerId: string; items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando Pagamento", PAID: "Pago", PREPARING: "Preparando",
  READY: "Pronto", OUT_FOR_DELIVERY: "Em Entrega", DELIVERED: "Entregue", CANCELLED: "Cancelado",
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
const NEXT_STATUS_LABEL: Record<string, string> = {
  PAID: "Iniciar Preparo →", PREPARING: "Marcar como Pronto →",
  READY: "Enviar para Entrega →", OUT_FOR_DELIVERY: "Confirmar Entrega →",
};
const PAYMENT_LABELS: Record<string, string> = { PIX: "Pix", CARD: "Cartão", CASH: "Dinheiro" };

type Props = { initialOrders: OrderData[]; cnpj: string; supplierNome: string };

export default function FornecedorOrdersClient({ initialOrders, cnpj, supplierNome }: Props) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isInteracting = useRef(false);

  const refresh = async () => {
    if (isInteracting.current) return;
    const res = await fetch(`/api/orders?cnpj=${cnpj}`);
    if (res.ok) {
      setOrders(await res.json());
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    const es = new EventSource(`/api/orders/stream?cnpj=${cnpj}`);
    es.onmessage = (e) => {
      if (isInteracting.current) return;
      try {
        setOrders(JSON.parse(e.data));
        setLastUpdated(new Date());
      } catch { /* ignore */ }
    };
    return () => es.close();
  }, [cnpj]);

  async function handleAdvance(orderId: string) {
    isInteracting.current = true;
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
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao avançar status");
    } finally {
      setActionLoading(null);
      isInteracting.current = false;
    }
  }

  async function handleCancel(orderId: string) {
    if (!confirm("Deseja cancelar este pedido?")) return;
    isInteracting.current = true;
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
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar pedido");
    } finally {
      setActionLoading(null);
      isInteracting.current = false;
    }
  }

  const subtotal = (o: OrderData) => o.items.reduce((s, i) => s + Number(i.precoUnitario) * i.quantidade, 0);
  const activeOrders = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status));
  const closedOrders = orders.filter((o) => ["DELIVERED", "CANCELLED"].includes(o.status));

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-black dark:text-white">Pedidos Recebidos</h1>
            <p className="text-sm text-zinc-500 mt-1">{supplierNome}</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <Link href="/dashboard/supplier"
              className="h-10 px-5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Dashboard
            </Link>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">{activeOrders.length} pedido{activeOrders.length !== 1 ? "s" : ""} ativo{activeOrders.length !== 1 ? "s" : ""}</p>

          {activeOrders.length === 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
              <p className="text-zinc-500">Nenhum pedido ativo no momento.</p>
            </div>
          )}

          {activeOrders.map((order, index) => (
            <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-500">Pedido #{orders.length - index}</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? ""}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <span className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleString("pt-BR")}</span>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                Cliente: <span className="font-medium text-black dark:text-white">{order.customer?.nome ?? order.customerId}</span>
                {order.paymentMethod && <span className="ml-2 text-xs text-zinc-400">· Pago via {PAYMENT_LABELS[order.paymentMethod]}</span>}
              </p>

              {order.items.length > 0 && (
                <div className="mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                      <span>{item.quantidade}x {item.product.nome}</span>
                      <span>R$ {(Number(item.precoUnitario) * item.quantidade).toFixed(2)}</span>
                    </div>
                  ))}
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

              <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {order.status === "PENDING" && <span className="text-xs text-zinc-400 italic">Aguardando pagamento do cliente</span>}
                {NEXT_STATUS_LABEL[order.status] && (
                  <button onClick={() => handleAdvance(order.id)} disabled={actionLoading === order.id}
                    className="h-8 px-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors">
                    {actionLoading === order.id ? "..." : NEXT_STATUS_LABEL[order.status]}
                  </button>
                )}
                {["PAID", "PREPARING", "READY"].includes(order.status) && (
                  <button onClick={() => handleCancel(order.id)} disabled={actionLoading === order.id}
                    className="h-8 px-4 rounded-full border border-red-200 dark:border-red-800 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}

          {closedOrders.length > 0 && (
            <details className="mt-2">
              <summary className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-600">
                {closedOrders.length} pedido{closedOrders.length !== 1 ? "s" : ""} finalizado{closedOrders.length !== 1 ? "s" : ""}
              </summary>
              <div className="flex flex-col gap-3 mt-3">
                {closedOrders.map((order, index) => (
                  <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Pedido #{orders.length - activeOrders.length - index}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? ""}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{order.customer?.nome} · {new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </main>
  );
}

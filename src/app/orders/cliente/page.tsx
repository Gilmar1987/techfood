"use client";

import { useState } from "react";
import Link from "next/link";

type OrderItem = { id: string; quantidade: number; precoUnitario: number; product: { nome: string } };
type OrderData = {
  id: string; status: string; paymentMethod: string | null; paidAt: string | null;
  frete: number; total: number; createdAt: string; supplierId: string;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando Pagamento", PAID: "Pago", PREPARING: "Preparando",
  READY: "Pronto para Entrega", OUT_FOR_DELIVERY: "Em Entrega",
  DELIVERED: "Entregue", CANCELLED: "Cancelado",
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

export default function ClienteOrdersPage() {
  const [cpf, setCpf] = useState("");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [identified, setIdentified] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSearch() {
    const sanitized = cpf.replace(/\D/g, "");
    if (sanitized.length !== 11) return setError("CPF deve ter 11 dígitos");
    setError("");

    const res = await fetch(`/api/orders?cpf=${sanitized}`);
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Erro ao buscar pedidos");
    setOrders(data);
    setIdentified(true);
  }

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
      setPayingId(null);
      const refresh = await fetch(`/api/orders?cpf=${cpf.replace(/\D/g, "")}`);
      setOrders(await refresh.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar pagamento");
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
      const refresh = await fetch(`/api/orders?cpf=${cpf.replace(/\D/g, "")}`);
      setOrders(await refresh.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar pedido");
    } finally {
      setActionLoading(null);
    }
  }

  const subtotal = (o: OrderData) => o.items.reduce((s, i) => s + Number(i.precoUnitario) * i.quantidade, 0);
  const inputClass = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400";

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-black dark:text-white">Meus Pedidos</h1>
          <Link href="/" className="h-10 px-5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
            Home
          </Link>
        </div>

        {/* Identificação */}
        {!identified && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-black dark:text-white">Identificar-se</h2>
            <div className="flex gap-3">
              <input type="text" placeholder="Digite seu CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} className={`flex-1 ${inputClass}`} />
              <button onClick={handleSearch} className="h-10 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200">
                Buscar
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}

        {/* Lista de pedidos */}
        {identified && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">{orders.length} pedido{orders.length !== 1 ? "s" : ""} encontrado{orders.length !== 1 ? "s" : ""}</p>
              <button onClick={() => { setIdentified(false); setOrders([]); }} className="text-xs text-zinc-400 hover:text-zinc-600">Trocar CPF</button>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}

            {orders.length === 0 ? (
              <p className="text-zinc-500">Nenhum pedido encontrado.</p>
            ) : (
              orders.map((order, index) => (
                <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-zinc-500">Pedido #{orders.length - index}</span>
                    <div className="flex items-center gap-2">
                      {order.paymentMethod && (
                        <span className="text-xs text-zinc-400">{PAYMENT_LABELS[order.paymentMethod]}</span>
                      )}
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? ""}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                  </div>

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

                  <p className="text-xs text-zinc-400 mb-3">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>

                  {/* Ações do cliente */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    {order.status === "PENDING" && (
                      payingId === order.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-zinc-500">Como deseja pagar?</span>
                          {(["PIX", "CARD", "CASH"] as const).map((m) => (
                            <button key={m} onClick={() => handlePay(order.id, m)} disabled={actionLoading === order.id}
                              className="h-8 px-4 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50">
                              {PAYMENT_LABELS[m]}
                            </button>
                          ))}
                          <button onClick={() => setPayingId(null)} className="h-8 px-3 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setPayingId(order.id)}
                          className="h-8 px-4 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                          Pagar Pedido
                        </button>
                      )
                    )}
                    {["PENDING", "PAID"].includes(order.status) && (
                      <button onClick={() => handleCancel(order.id)} disabled={actionLoading === order.id}
                        className="h-8 px-4 rounded-full border border-red-200 dark:border-red-800 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-colors">
                        Cancelar Pedido
                      </button>
                    )}
                    {!["PENDING", "PAID", "CANCELLED"].includes(order.status) && (
                      <span className="text-xs text-zinc-400 italic">Em processamento pelo fornecedor</span>
                    )}
                    {order.status === "DELIVERED" && <span className="text-xs text-green-600 font-medium">✓ Pedido entregue</span>}
                    {order.status === "CANCELLED" && <span className="text-xs text-red-500 italic">Pedido cancelado</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

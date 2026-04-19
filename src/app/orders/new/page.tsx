"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProductData = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
};

type OrderItem = {
  productId: string;
  nome: string;
  preco: number;
  quantidade: number;
};

type CustomerData = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
};

export default function NewOrderPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [step, setStep] = useState<"identify" | "order">("identify");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [productError, setProductError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProductError("Erro ao carregar produtos."));
  }, []);

  async function handleSearchCustomer() {
    if (!cpf) return setError("Informe o CPF");
    setError("");

    const res = await fetch(`/api/customer?cpf=${encodeURIComponent(cpf)}`);
    const data = await res.json();

    if (!res.ok) return setError(data.error || "Cliente não encontrado");
    setCustomer(data);
  }

  function handleConfirmCustomer() {
    setStep("order");
  }

  function addItem(product: ProductData) {
    const exist = items.find((i) => i.productId === product.id);
    if (exist) {
      setItems(items.map((i) =>
        i.productId === product.id ? { ...i, quantidade: i.quantidade + 1 } : i
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        nome: product.nome,
        preco: Number(product.preco),
        quantidade: 1,
      }]);
    }
  }

  function removeItem(productId: string) {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    if (item.quantidade === 1) {
      setItems(items.filter((i) => i.productId !== productId));
    } else {
      setItems(items.map((i) =>
        i.productId === productId ? { ...i, quantidade: i.quantidade - 1 } : i
      ));
    }
  }

  function updateQuantity(productId: string, value: string) {
    const quantidade = Number(value);
    if (quantidade <= 0) return;
    setItems(items.map((i) =>
      i.productId === productId ? { ...i, quantidade } : i
    ));
  }

  const subtotal = items.reduce((total, item) => total + item.preco * item.quantidade, 0);

  async function handleSubmit() {
    if (!customer) return setError("Cliente não selecionado");
    if (items.length === 0) return setError("Adicione pelo menos um item");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          items: items.map((i) => ({ productId: i.productId, quantidade: i.quantidade })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => {
        setStep("identify");
        setCustomer(null);
        setItems([]);
        setCpf("");
        setSuccess(false);
        router.push("/orders");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400";

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-black dark:text-white mb-8">Novo Pedido</h1>

        {error && (
          <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-4 text-sm text-green-600 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
            Pedido criado com sucesso! Redirecionando...
          </p>
        )}

        {/* Step 1 — Identificar cliente */}
        {step === "identify" && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-black dark:text-white">Identificar Cliente</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Digite o CPF do cliente"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className={`flex-1 ${inputClass}`}
              />
              <button
                onClick={handleSearchCustomer}
                className="h-10 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Buscar
              </button>
            </div>

            {customer && (
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">{customer.nome}</p>
                  <p className="text-xs text-zinc-400">{customer.email}</p>
                </div>
                <button
                  onClick={handleConfirmCustomer}
                  className="h-9 px-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800"
                >
                  Confirmar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Montar pedido */}
        {step === "order" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Cliente</p>
                <p className="text-sm font-medium text-black dark:text-white">{customer?.nome}</p>
              </div>
              <button
                onClick={() => { setStep("identify"); setCustomer(null); setItems([]); }}
                className="text-xs text-zinc-400 hover:text-zinc-600"
              >
                Trocar
              </button>
            </div>

            {productError && <p className="text-sm text-red-500">{productError}</p>}

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
              <h2 className="text-base font-semibold text-black dark:text-white mb-2">Produtos</h2>
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">{product.nome}</p>
                    <p className="text-xs text-zinc-400">R$ {Number(product.preco).toFixed(2)} — Estoque: {product.quantidade}</p>
                  </div>
                  <button
                    onClick={() => addItem(product)}
                    className="h-8 px-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-medium transition-colors hover:bg-zinc-800"
                  >
                    + Adicionar
                  </button>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
                <h2 className="text-base font-semibold text-black dark:text-white mb-2">Itens do Pedido</h2>
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-4">
                    <p className="text-sm text-black dark:text-white flex-1">{item.nome}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeItem(item.productId)} className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800">−</button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => updateQuantity(item.productId, e.target.value)}
                        className="w-14 text-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-sm text-black dark:text-white outline-none"
                      />
                      <button onClick={() => { const p = products.find((p) => p.id === item.productId); if (p) addItem(p); }} className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800">+</button>
                    </div>
                    <p className="text-sm font-medium text-black dark:text-white w-20 text-right">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </p>
                  </div>
                ))}

                <div className="flex justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-semibold text-black dark:text-white">Total</span>
                  <span className="text-sm font-semibold text-black dark:text-white">R$ {subtotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-2 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Criando pedido..." : "Finalizar Pedido"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

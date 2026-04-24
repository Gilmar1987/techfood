"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CustomerData = { id: string; nome: string; email: string; cpf: string; endereco: string; cep: string; telefone: string };
type SupplierData = { id: string; razaoSocial: string; cnpj: string };
type ProductData = { id: string; nome: string; preco: number; quantidade: number };
type OrderItem = { productId: string; nome: string; preco: number; quantidade: number };
type FreteData = { distanciaKm: number | null; valor: number | null; prazoEstimadoDias: number | null; faixa: string; endereco: string; semCoordenadas?: boolean };

type Step = "address" | "supplier" | "order";

const inputClass = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400 w-full";

export default function NewOrderClient({ customer: initialCustomer }: { customer: CustomerData }) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("address");
  const [customer, setCustomer] = useState<CustomerData>(initialCustomer);
  const [endereco, setEndereco] = useState(initialCustomer.endereco);
  const [cep, setCep] = useState(initialCustomer.cep);
  const [frete, setFrete] = useState<FreteData | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleCalcularFrete(supplierId: string) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return setError("CEP inválido");
    setLoading(true);
    setError("");
    try {
      if (endereco !== customer.endereco || cep !== customer.cep) {
        const res = await fetch("/api/customer", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: customer.id, endereco, cep }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCustomer(data);
      }
      const res = await fetch(`/api/frete?cep=${cleanCep}&supplierId=${supplierId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFrete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao calcular frete");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmAddress() {
    setError("");
    const res = await fetch("/api/supplier");
    const data = await res.json();
    if (!res.ok) return setError("Erro ao carregar fornecedores");
    setSuppliers(data);
    setStep("supplier");
  }

  async function handleSelectSupplier(s: SupplierData) {
    setSupplier(s);
    setFrete(null);
    setError("");
    setItems([]);
    await handleCalcularFrete(s.id);
    const res = await fetch(`/api/products?supplierId=${s.id}`);
    const data = await res.json();
    if (!res.ok) return setError("Erro ao carregar produtos");
    setProducts(data);
    setStep("order");
  }

  function addItem(product: ProductData) {
    if ((items.find((i) => i.productId === product.id)?.quantidade ?? 0) >= product.quantidade) return;
    const exist = items.find((i) => i.productId === product.id);
    if (exist) {
      setItems(items.map((i) => i.productId === product.id ? { ...i, quantidade: i.quantidade + 1 } : i));
    } else {
      setItems([...items, { productId: product.id, nome: product.nome, preco: Number(product.preco), quantidade: 1 }]);
    }
  }

  function removeItem(productId: string) {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    if (item.quantidade === 1) setItems(items.filter((i) => i.productId !== productId));
    else setItems(items.map((i) => i.productId === productId ? { ...i, quantidade: i.quantidade - 1 } : i));
  }

  function updateQuantity(productId: string, value: string) {
    const quantidade = Number(value);
    if (quantidade <= 0) return;
    const product = products.find((p) => p.id === productId);
    if (product && quantidade > product.quantidade) return;
    setItems(items.map((i) => i.productId === productId ? { ...i, quantidade } : i));
  }

  const isEsgotado = (p: ProductData) => (items.find((i) => i.productId === p.id)?.quantidade ?? 0) >= p.quantidade;
  const subtotal = items.reduce((t, i) => t + i.preco * i.quantidade, 0);
  const totalComFrete = subtotal + (frete && !frete.semCoordenadas ? (frete.valor ?? 0) : 0);

  async function handleSubmit() {
    if (!supplier || items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          supplierId: supplier.id,
          frete: frete?.semCoordenadas ? 0 : (frete?.valor ?? 0),
          items: items.map((i) => ({ productId: i.productId, quantidade: i.quantidade })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => router.push("/orders/cliente"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: "address", label: "Endereço" },
    { key: "supplier", label: "Fornecedor" },
    { key: "order", label: "Pedido" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-black dark:text-white">Novo Pedido</h1>
          <Link href="/dashboard/customer" className="text-sm text-zinc-400 hover:text-zinc-600">Dashboard</Link>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${i <= stepIndex ? "bg-black dark:bg-white text-white dark:text-black" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <span className="text-zinc-300 dark:text-zinc-700 text-xs">→</span>}
            </div>
          ))}
        </div>

        {error && <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-600 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">Pedido criado! Redirecionando...</p>}

        {/* Customer badge */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-3 mb-4">
          <span className="text-xl">👤</span>
          <div>
            <p className="text-sm font-medium text-black dark:text-white">{customer.nome}</p>
            <p className="text-xs text-zinc-400">{customer.email}</p>
          </div>
        </div>

        {/* Step: Endereço */}
        {step === "address" && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-black dark:text-white">Confirmar Endereço de Entrega</h2>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">Endereço</label>
              <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">CEP</label>
              <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" className={inputClass} />
            </div>
            <button onClick={handleConfirmAddress} className="h-10 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200">
              Confirmar e Escolher Fornecedor
            </button>
          </div>
        )}

        {/* Step: Fornecedor */}
        {step === "supplier" && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
            <h2 className="text-base font-semibold text-black dark:text-white mb-2">Escolha o Fornecedor</h2>
            <p className="text-xs text-zinc-400">O frete será calculado com base na distância entre o fornecedor e seu CEP.</p>
            {suppliers.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhum fornecedor disponível.</p>
            ) : (
              suppliers.map((s) => (
                <button key={s.id} onClick={() => handleSelectSupplier(s)}
                  className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">{s.razaoSocial}</p>
                    <p className="text-xs text-zinc-400">{s.cnpj}</p>
                  </div>
                  <span className="text-xs text-zinc-400">→</span>
                </button>
              ))
            )}
            <button onClick={() => setStep("address")} className="text-xs text-zinc-400 hover:text-zinc-600 text-left mt-2">← Alterar endereço</button>
          </div>
        )}

        {/* Step: Pedido */}
        {step === "order" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Fornecedor</p>
                <p className="text-sm font-medium text-black dark:text-white">{supplier?.razaoSocial}</p>
              </div>
              <button onClick={() => { setStep("supplier"); setSupplier(null); setItems([]); setFrete(null); }} className="text-xs text-zinc-400 hover:text-zinc-600">Trocar</button>
            </div>

            {frete && (
              <div className={`rounded-xl border p-4 flex flex-col gap-1 ${frete.semCoordenadas ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800" : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${frete.semCoordenadas ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400"}`}>Frete</p>
                {frete.semCoordenadas ? (
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Coordenadas não disponíveis. O frete será combinado na entrega.</p>
                ) : (
                  <>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{frete.faixa} — {frete.distanciaKm?.toFixed(1)} km</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Entrega em até {frete.prazoEstimadoDias} dia{(frete.prazoEstimadoDias ?? 0) > 1 ? "s" : ""} · {frete.endereco}</p>
                    <p className="text-base font-bold text-blue-700 dark:text-blue-300 mt-1">R$ {(frete.valor ?? 0).toFixed(2)}</p>
                  </>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
              <h2 className="text-base font-semibold text-black dark:text-white mb-2">Produtos de {supplier?.razaoSocial}</h2>
              {products.length === 0 ? <p className="text-sm text-zinc-500">Nenhum produto disponível.</p> : (
                products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">{product.nome}</p>
                      <p className="text-xs text-zinc-400">R$ {Number(product.preco).toFixed(2)} — Estoque: {product.quantidade}
                        {isEsgotado(product) && <span className="ml-2 text-red-500 font-medium">Indisponível</span>}
                      </p>
                    </div>
                    <button onClick={() => addItem(product)} disabled={isEsgotado(product)}
                      className="h-8 px-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-medium transition-colors hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed">
                      + Adicionar
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
                <h2 className="text-base font-semibold text-black dark:text-white mb-2">Itens do Pedido</h2>
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-4">
                    <p className="text-sm text-black dark:text-white flex-1">{item.nome}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeItem(item.productId)} className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800">−</button>
                      <input type="number" min="1" value={item.quantidade}
                        onChange={(e) => updateQuantity(item.productId, e.target.value)}
                        className="w-14 text-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-sm text-black dark:text-white outline-none"
                      />
                      <button onClick={() => { const p = products.find((p) => p.id === item.productId); if (p) addItem(p); }}
                        disabled={(() => { const p = products.find((p) => p.id === item.productId); return p ? isEsgotado(p) : true; })()}
                        className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                    </div>
                    <p className="text-sm font-medium text-black dark:text-white w-20 text-right">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                  </div>
                ))}

                <div className="flex flex-col gap-1 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between text-sm text-zinc-500"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                  {frete && !frete.semCoordenadas && (
                    <div className="flex justify-between text-sm text-zinc-500"><span>Frete ({frete.faixa})</span><span>R$ {(frete.valor ?? 0).toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between text-base font-semibold text-black dark:text-white mt-1"><span>Total</span><span>R$ {totalComFrete.toFixed(2)}</span></div>
                </div>

                <button onClick={handleSubmit} disabled={loading}
                  className="mt-2 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed">
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

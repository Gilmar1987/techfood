"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CustomerData = { id: string; nome: string; email: string; cpf: string; endereco: string; cep: string; telefone: string };
type SupplierData = { id: string; razaoSocial: string; cnpj: string };
type ProductData = { id: string; nome: string; preco: number; quantidade: number };
type OrderItem = { productId: string; nome: string; preco: number; quantidade: number };
type FreteData = { distanciaKm: number | null; valor: number; prazoEstimadoDias: number | null; faixa: string; endereco: string; semCoordenadas?: boolean };

type Step = "identify" | "register" | "address" | "supplier" | "order";

const inputClass = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400 w-full";

export default function NewOrderPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("identify");
  const [cpf, setCpf] = useState("");
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [frete, setFrete] = useState<FreteData | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Formulário de cadastro
  const [regForm, setRegForm] = useState({ nome: "", email: "", endereco: "", cep: "", telefone: "" });

  // ─── Step 1: Identificar cliente ───────────────────────────────────────────
  async function handleSearchCustomer() {
    const sanitized = cpf.replace(/\D/g, "");
    if (sanitized.length !== 11) return setError("CPF deve ter 11 dígitos");
    setError("");

    const res = await fetch(`/api/customer?cpf=${sanitized}`);
    const data = await res.json();

    if (res.status === 404) {
      setRegForm((f) => ({ ...f }));
      setStep("register");
      return;
    }
    if (!res.ok) return setError(data.error || "Erro ao buscar cliente");

    setCustomer(data);
    setEndereco(data.endereco);
    setCep(data.cep);
    setStep("address");
  }

  // ─── Step 2: Cadastrar cliente ─────────────────────────────────────────────
  async function handleRegister() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...regForm, cpf: cpf.replace(/\D/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCustomer(data);
      setEndereco(data.endereco);
      setCep(data.cep);
      setStep("address");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar cliente");
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 3: Confirmar/alterar endereço e calcular frete ──────────────────
  async function handleCalcularFrete(supplierId: string) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return setError("CEP inválido");
    setLoading(true);
    setError("");

    try {
      // Atualiza endereço se alterado
      if (customer && (endereco !== customer.endereco || cep !== customer.cep)) {
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

  // ─── Step 4: Selecionar fornecedor ────────────────────────────────────────
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

  // ─── Step 5: Montar pedido ────────────────────────────────────────────────
  function getQuantidadeNoCarrinho(productId: string) {
    return items.find((i) => i.productId === productId)?.quantidade ?? 0;
  }

  function isEstoqueEsgotado(product: ProductData) {
    return getQuantidadeNoCarrinho(product.id) >= product.quantidade;
  }

  function addItem(product: ProductData) {
    if (isEstoqueEsgotado(product)) return;
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
    if (item.quantidade === 1) {
      setItems(items.filter((i) => i.productId !== productId));
    } else {
      setItems(items.map((i) => i.productId === productId ? { ...i, quantidade: i.quantidade - 1 } : i));
    }
  }

  function updateQuantity(productId: string, value: string) {
    const quantidade = Number(value);
    if (quantidade <= 0) return;
    const product = products.find((p) => p.id === productId);
    if (product && quantidade > product.quantidade) return;
    setItems(items.map((i) => i.productId === productId ? { ...i, quantidade } : i));
  }

  const subtotal = items.reduce((t, i) => t + i.preco * i.quantidade, 0);
  const totalComFrete = subtotal + (frete && !frete.semCoordenadas ? frete.valor : 0);

  async function handleSubmit() {
    if (!customer || !supplier || items.length === 0) return;
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
      setTimeout(() => router.push("/orders"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  }

  // ─── Breadcrumb ───────────────────────────────────────────────────────────
  const steps: { key: Step; label: string }[] = [
    { key: "identify", label: "Cliente" },
    { key: "address", label: "Endereço" },
    { key: "supplier", label: "Fornecedor" },
    { key: "order", label: "Pedido" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step || (step === "register" && s.key === "identify"));

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-black dark:text-white mb-6">Novo Pedido</h1>

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
        {success && <p className="mb-4 text-sm text-green-600 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">Pedido criado com sucesso! Redirecionando...</p>}

        {/* ── Step 1: Identificar ── */}
        {step === "identify" && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-black dark:text-white">Identificar Cliente</h2>
            <div className="flex gap-3">
              <input type="text" placeholder="Digite o CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} className={inputClass} />
              <button onClick={handleSearchCustomer} className="h-10 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 whitespace-nowrap">
                Buscar
              </button>
            </div>
            <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 text-center">Voltar para Home</Link>
          </div>
        )}

        {/* ── Step 2: Cadastrar ── */}
        {step === "register" && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-black dark:text-white">Cadastrar Cliente</h2>
              <span className="text-xs text-zinc-400">CPF: {cpf}</span>
            </div>
            {(["nome", "email", "telefone", "endereco", "cep"] as const).map((field) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500 capitalize">{field === "cep" ? "CEP" : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === "email" ? "email" : field === "telefone" ? "tel" : "text"}
                  value={regForm[field]}
                  onChange={(e) => setRegForm({ ...regForm, [field]: e.target.value })}
                  placeholder={field === "cep" ? "00000-000" : field === "telefone" ? "(00) 00000-0000" : ""}
                  className={inputClass}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={handleRegister} disabled={loading} className="h-10 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 disabled:opacity-50">
                {loading ? "Cadastrando..." : "Cadastrar e Continuar"}
              </button>
              <button onClick={() => setStep("identify")} className="h-10 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Voltar
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Endereço ── */}
        {step === "address" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Cliente</p>
                <p className="text-sm font-medium text-black dark:text-white">{customer?.nome}</p>
                <p className="text-xs text-zinc-400">{customer?.email}</p>
              </div>
              <button onClick={() => setStep("identify")} className="text-xs text-zinc-400 hover:text-zinc-600">Trocar</button>
            </div>

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
          </div>
        )}

        {/* ── Step 4: Fornecedor ── */}
        {step === "supplier" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-zinc-400">Cliente</p>
                  <p className="text-sm font-medium text-black dark:text-white">{customer?.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Entrega</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{cep}</p>
                </div>
              </div>
              <button onClick={() => setStep("address")} className="text-xs text-zinc-400 hover:text-zinc-600">Alterar</button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
              <h2 className="text-base font-semibold text-black dark:text-white mb-2">Escolha o Fornecedor</h2>
              <p className="text-xs text-zinc-400">O frete será calculado com base na distância entre o fornecedor e seu CEP.</p>
              {suppliers.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhum fornecedor disponível.</p>
              ) : (
                suppliers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSupplier(s)}
                    className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">{s.razaoSocial}</p>
                      <p className="text-xs text-zinc-400">{s.cnpj}</p>
                    </div>
                    <span className="text-xs text-zinc-400">→</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Step 5: Pedido ── */}
        {step === "order" && (
          <div className="flex flex-col gap-6">
            {/* Resumo */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-zinc-400">Cliente</p>
                  <p className="text-sm font-medium text-black dark:text-white">{customer?.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Fornecedor</p>
                  <p className="text-sm font-medium text-black dark:text-white">{supplier?.razaoSocial}</p>
                </div>
              </div>
              <button onClick={() => { setStep("supplier"); setSupplier(null); setItems([]); setFrete(null); }} className="text-xs text-zinc-400 hover:text-zinc-600">Trocar</button>
            </div>

            {/* Frete */}
            {frete && (
              <div className={`rounded-xl border p-4 flex flex-col gap-1 ${
                frete.semCoordenadas
                  ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
                  : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${
                  frete.semCoordenadas ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400"
                }`}>Frete</p>
                {frete.semCoordenadas ? (
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Coordenadas não disponíveis para o CEP informado. O frete será combinado na entrega.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{frete.faixa} — {frete.distanciaKm?.toFixed(1)} km</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Entrega em até {frete.prazoEstimadoDias} dia{(frete.prazoEstimadoDias ?? 0) > 1 ? "s" : ""} · {frete.endereco}</p>
                    <p className="text-base font-bold text-blue-700 dark:text-blue-300 mt-1">R$ {frete.valor.toFixed(2)}</p>
                  </>
                )}
              </div>
            )}

            {/* Produtos */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
              <h2 className="text-base font-semibold text-black dark:text-white mb-2">Produtos de {supplier?.razaoSocial}</h2>
              {products.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhum produto disponível.</p>
              ) : (
                products.map((product) => {
                  const esgotado = isEstoqueEsgotado(product);
                  return (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">{product.nome}</p>
                        <p className="text-xs text-zinc-400">
                          R$ {Number(product.preco).toFixed(2)} — Estoque: {product.quantidade}
                          {esgotado && <span className="ml-2 text-red-500 font-medium">Indisponível</span>}
                        </p>
                      </div>
                      <button onClick={() => addItem(product)} disabled={esgotado} className="h-8 px-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-medium transition-colors hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed">
                        + Adicionar
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Carrinho */}
            {items.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
                <h2 className="text-base font-semibold text-black dark:text-white mb-2">Itens do Pedido</h2>
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-4">
                    <p className="text-sm text-black dark:text-white flex-1">{item.nome}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeItem(item.productId)} className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800">−</button>
                      <input
                        type="number" min="1" value={item.quantidade}
                        onChange={(e) => updateQuantity(item.productId, e.target.value)}
                        className="w-14 text-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-sm text-black dark:text-white outline-none"
                      />
                      <button
                        onClick={() => { const p = products.find((p) => p.id === item.productId); if (p) addItem(p); }}
                        disabled={(() => { const p = products.find((p) => p.id === item.productId); return p ? isEstoqueEsgotado(p) : true; })()}
                        className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                      >+</button>
                    </div>
                    <p className="text-sm font-medium text-black dark:text-white w-20 text-right">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                  </div>
                ))}

                <div className="flex flex-col gap-1 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {frete && (
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Frete ({frete.faixa})</span>
                      <span>R$ {frete.valor.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold text-black dark:text-white mt-1">
                    <span>Total</span>
                    <span>R$ {totalComFrete.toFixed(2)}</span>
                  </div>
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

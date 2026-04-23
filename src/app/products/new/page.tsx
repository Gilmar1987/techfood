"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SupplierData = {
  id: string;
  razaoSocial: string;
  cnpj: string;
};

type ProductForm = {
  nome: string;
  preco: string;
  quantidade: string;
};

const emptyForm = (): ProductForm => ({ nome: "", preco: "", quantidade: "" });

export default function NewProductPage() {
  const router = useRouter();
  const [cnpj, setCnpj] = useState("");
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [step, setStep] = useState<"identify" | "products">("identify");
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [created, setCreated] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSearchSupplier() {
    const sanitized = cnpj.replace(/[\D]/g, "");
    if (sanitized.length !== 14) return setError("CNPJ deve ter 14 dígitos");
    setError("");

    const res = await fetch(`/api/supplier?cnpj=${sanitized}`);
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Fornecedor não encontrado");
    setSupplier(data);
  }

  async function handleAddProduct() {
    if (!form.nome || !form.preco || !form.quantidade) return setError("Preencha todos os campos");
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          preco: Number(form.preco),
          quantidade: Number(form.quantidade),
          supplierId: supplier!.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar produto");

      setCreated((prev) => [...prev, form.nome]);
      setSuccess(`"${form.nome}" adicionado com sucesso!`);
      setForm(emptyForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  function handleExit() {
    router.push("/products");
  }

  const inputClass = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400";

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-semibold text-black dark:text-white mb-8">Novo Produto</h1>

        {/* Step 1 — Identificar fornecedor */}
        {step === "identify" && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-black dark:text-white">Identificar Fornecedor</h2>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Digite o CNPJ do fornecedor"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className={`flex-1 ${inputClass}`}
              />
              <button
                onClick={handleSearchSupplier}
                className="h-10 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Buscar
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {supplier && (
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">{supplier.razaoSocial}</p>
                  <p className="text-xs text-zinc-400">{supplier.cnpj}</p>
                </div>
                <button
                  onClick={() => { setStep("products"); setError(""); }}
                  className="h-9 px-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800"
                >
                  Confirmar
                </button>
              </div>
            )}

            <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 text-center">
              Voltar para Home
            </Link>
          </div>
        )}

        {/* Step 2 — Adicionar produtos */}
        {step === "products" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Fornecedor</p>
                <p className="text-sm font-medium text-black dark:text-white">{supplier?.razaoSocial}</p>
              </div>
              <button
                onClick={handleExit}
                className="h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Sair
              </button>
            </div>

            {created.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <p className="text-xs text-zinc-400 mb-2">Produtos adicionados nesta sessão</p>
                <div className="flex flex-col gap-1">
                  {created.map((nome, i) => (
                    <p key={i} className="text-sm text-zinc-700 dark:text-zinc-300">✓ {nome}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-black dark:text-white">Dados do Produto</h2>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Nome do produto"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Quantidade</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={form.quantidade}
                  onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                  placeholder="0"
                  className={inputClass}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                  {success}
                </p>
              )}

              <button
                onClick={handleAddProduct}
                disabled={loading}
                className="h-10 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adicionando..." : "+ Adicionar Produto"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

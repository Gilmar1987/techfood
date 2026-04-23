"use client";

import { useState } from "react";
import Link from "next/link";

type SupplierData = { id: string; razaoSocial: string; cnpj: string };
type ProductData = { id: string; nome: string; preco: number; quantidade: number; supplierId: string };
type ProductForm = { nome: string; preco: string; quantidade: string };

const emptyForm = (): ProductForm => ({ nome: "", preco: "", quantidade: "" });

export default function ManageProductsPage() {
  const [cnpj, setCnpj] = useState("");
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [step, setStep] = useState<"identify" | "manage">("identify");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400";

  async function handleSearchSupplier() {
    const sanitized = cnpj.replace(/[\D]/g, "");
    if (sanitized.length !== 14) return setError("CNPJ deve ter 14 dígitos");
    setError("");

    const res = await fetch(`/api/supplier?cnpj=${sanitized}`);
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Fornecedor não encontrado");
    setSupplier(data);
  }

  async function loadProducts(supplierId: string) {
    const res = await fetch(`/api/products?supplierId=${supplierId}`);
    const data = await res.json();
    if (res.ok) setProducts(data);
  }

  async function handleConfirmSupplier() {
    await loadProducts(supplier!.id);
    setStep("manage");
    setError("");
  }

  async function handleCreate() {
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
      if (!res.ok) throw new Error(data.error);
      setSuccess(`"${form.nome}" criado com sucesso!`);
      setForm(emptyForm());
      await loadProducts(supplier!.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar produto");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editingId || !form.nome || !form.preco || !form.quantidade) return setError("Preencha todos os campos");
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          nome: form.nome,
          preco: Number(form.preco),
          quantidade: Number(form.quantidade),
          supplierId: supplier!.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`"${form.nome}" atualizado com sucesso!`);
      setForm(emptyForm());
      setEditingId(null);
      await loadProducts(supplier!.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar produto");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(product: ProductData) {
    if (!confirm(`Deseja remover "${product.nome}"?`)) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/products?id=${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`"${product.nome}" removido com sucesso!`);
      await loadProducts(supplier!.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover produto");
    }
  }

  function handleEdit(product: ProductData) {
    setEditingId(product.id);
    setForm({ nome: product.nome, preco: String(product.preco), quantidade: String(product.quantidade) });
    setError("");
    setSuccess("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-black dark:text-white mb-8">Gerenciar Produtos</h1>

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

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}

            {supplier && (
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">{supplier.razaoSocial}</p>
                  <p className="text-xs text-zinc-400">{supplier.cnpj}</p>
                </div>
                <button
                  onClick={handleConfirmSupplier}
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

        {/* Step 2 — Gerenciar produtos */}
        {step === "manage" && (
          <div className="flex flex-col gap-6">

            {/* Header do fornecedor */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Fornecedor</p>
                <p className="text-sm font-medium text-black dark:text-white">{supplier?.razaoSocial}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("identify"); setSupplier(null); setProducts([]); setForm(emptyForm()); setEditingId(null); }}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Trocar
                </button>
                <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600">Home</Link>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">{success}</p>}

            {/* Formulário criar / editar */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-black dark:text-white">
                {editingId ? "Editar Produto" : "Novo Produto"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-500">Nome</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Nome do produto"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-500">Preço (R$)</label>
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
                  <label className="text-xs font-medium text-zinc-500">Quantidade</label>
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
              </div>

              <div className="flex gap-3">
                <button
                  onClick={editingId ? handleUpdate : handleCreate}
                  disabled={loading}
                  className="h-10 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "+ Adicionar Produto"}
                </button>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="h-10 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* Lista de produtos */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-black dark:text-white">
                  Produtos ({products.length})
                </h2>
              </div>

              {products.length === 0 ? (
                <p className="text-sm text-zinc-500 p-6">Nenhum produto cadastrado para este fornecedor.</p>
              ) : (
                <table className="w-full">
                  <thead className="border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-zinc-400 uppercase">Nome</th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-zinc-400 uppercase">Preço</th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-zinc-400 uppercase">Estoque</th>
                      <th className="py-3 px-6 text-right text-xs font-semibold text-zinc-400 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${editingId === product.id ? "bg-zinc-50 dark:bg-zinc-800/50" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"}`}
                      >
                        <td className="py-3 px-6 text-sm font-medium text-black dark:text-white">{product.nome}</td>
                        <td className="py-3 px-6 text-sm text-zinc-600 dark:text-zinc-400">R$ {Number(product.preco).toFixed(2)}</td>
                        <td className="py-3 px-6">
                          <span className={`text-sm font-medium ${product.quantidade === 0 ? "text-red-500" : "text-black dark:text-white"}`}>
                            {product.quantidade}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-xs font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

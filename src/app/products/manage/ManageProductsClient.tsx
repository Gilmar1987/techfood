"use client";

import { useState } from "react";
import Link from "next/link";

type SupplierData = { id: string; razaoSocial: string; cnpj: string };
type ProductData = { id: string; nome: string; preco: number; quantidade: number; supplierId: string };
type ProductForm = { nome: string; preco: string; quantidade: string };

const emptyForm = (): ProductForm => ({ nome: "", preco: "", quantidade: "" });

type Props = { supplier: SupplierData; initialProducts: ProductData[] };

export default function ManageProductsClient({ supplier, initialProducts }: Props) {
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400";

  async function loadProducts() {
    const res = await fetch(`/api/products?supplierId=${supplier.id}`);
    if (res.ok) setProducts(await res.json());
  }

  async function handleCreate() {
    if (!form.nome || !form.preco || !form.quantidade) return setError("Preencha todos os campos");
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, preco: Number(form.preco), quantidade: Number(form.quantidade), supplierId: supplier.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`"${form.nome}" criado com sucesso!`);
      setForm(emptyForm());
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar produto");
    } finally { setLoading(false); }
  }

  async function handleUpdate() {
    if (!editingId || !form.nome || !form.preco || !form.quantidade) return setError("Preencha todos os campos");
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, nome: form.nome, preco: Number(form.preco), quantidade: Number(form.quantidade), supplierId: supplier.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`"${form.nome}" atualizado com sucesso!`);
      setForm(emptyForm()); setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar produto");
    } finally { setLoading(false); }
  }

  async function handleDelete(product: ProductData) {
    if (!confirm(`Deseja remover "${product.nome}"?`)) return;
    setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/products?id=${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`"${product.nome}" removido com sucesso!`);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover produto");
    }
  }

  function handleEdit(product: ProductData) {
    setEditingId(product.id);
    setForm({ nome: product.nome, preco: String(product.preco), quantidade: String(product.quantidade) });
    setError(""); setSuccess("");
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-black dark:text-white">Meus Produtos</h1>
            <p className="text-sm text-zinc-500 mt-1">{supplier.razaoSocial}</p>
          </div>
          <Link href="/dashboard/supplier"
            className="h-10 px-5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
            Dashboard
          </Link>
        </div>

        {error && <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-600 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">{success}</p>}

        <div className="flex flex-col gap-6">
          {/* Formulário */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-black dark:text-white">{editingId ? "Editar Produto" : "Novo Produto"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Nome", key: "nome", type: "text", placeholder: "Nome do produto" },
                { label: "Preço (R$)", key: "preco", type: "number", placeholder: "0.00" },
                { label: "Quantidade", key: "quantidade", type: "number", placeholder: "0" },
              ].map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-500">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof ProductForm]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} className={inputClass}
                    step={f.key === "preco" ? "0.01" : "1"} min="0"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={editingId ? handleUpdate : handleCreate} disabled={loading}
                className="h-10 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "+ Adicionar Produto"}
              </button>
              {editingId && (
                <button onClick={() => { setEditingId(null); setForm(emptyForm()); setError(""); }}
                  className="h-10 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-black dark:text-white">Produtos ({products.length})</h2>
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-zinc-500 p-6">Nenhum produto cadastrado ainda.</p>
            ) : (
              <table className="w-full">
                <thead className="border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    {["Nome", "Preço", "Estoque", "Ações"].map((h, i) => (
                      <th key={h} className={`py-3 px-6 text-xs font-semibold text-zinc-400 uppercase ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}
                      className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${editingId === product.id ? "bg-zinc-50 dark:bg-zinc-800/50" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"}`}>
                      <td className="py-3 px-6 text-sm font-medium text-black dark:text-white">{product.nome}</td>
                      <td className="py-3 px-6 text-sm text-zinc-600 dark:text-zinc-400">R$ {Number(product.preco).toFixed(2)}</td>
                      <td className="py-3 px-6">
                        <span className={`text-sm font-medium ${product.quantidade === 0 ? "text-red-500" : "text-black dark:text-white"}`}>
                          {product.quantidade}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleEdit(product)} className="text-xs font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors">Editar</button>
                          <button onClick={() => handleDelete(product)} className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors">Remover</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProductPage() {
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [preco, setPreco] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome,
                    preco: Number(preco),
                    quantidade: Number(quantidade),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Failed to create product");
            }

            setSuccess(true);
            setNome("");
            setPreco("");
            setQuantidade("");
            setTimeout(() => router.push("/products"), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-semibold text-black dark:text-white mb-8">
                    Novo Produto
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5"
                >
                    <div className="flex flex-col gap-1">
                        <label htmlFor="nome" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Nome
                        </label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="preco" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Preço (R$)
                        </label>
                        <input
                            id="preco"
                            type="number"
                            step="0.01"
                            min="0"
                            value={preco}
                            onChange={(e) => setPreco(e.target.value)}
                            required
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="quantidade" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Quantidade
                        </label>
                        <input
                            id="quantidade"
                            type="number"
                            step="1"
                            min="0"
                            value={quantidade}
                            onChange={(e) => setQuantidade(e.target.value)}
                            required
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                            Produto criado com sucesso! Redirecionando...
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-10 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Criando..." : "Criar Produto"}
                    </button>
                </form>

                <Link
                    href="/products"
                    className="h-11 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    Ver Todos
                </Link>

                <Link
                    href="/"
                    className="h-11 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    Voltar para Home
                </Link>
            </div>
        </main>
    );
}

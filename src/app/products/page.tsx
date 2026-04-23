import { productRepository } from "@/server/container";
import Link from "next/link";
import ProductList from "./ProductList";

export default async function ProductsPage() {
  const products = await productRepository.findAll();

  const serialized = products.map((p) => ({
    id: p.id,
    nome: p.nome,
    preco: p.preco,
    quantidade: p.quantidade,
  }));

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-black dark:text-white">
            Produtos
          </h1>
          <Link
            href="/products/new"
            className="h-10 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium flex items-center transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            + Novo Produto
          </Link>
          <Link
            href="/products/manage"
            className="h-10 px-5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Gerenciar
          </Link>
        </div>

        <ProductList products={serialized} />

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

"use client";
import { useState } from "react";
import Link from "next/link";


type ProductData = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
};

const PAGE_SIZE = 5;

export default function ProductList({ products }: { products: ProductData[] }) {
  const [visible, setVisible] = useState(true);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleToggle() {
    setVisible((v) => !v);
    setPage(1);
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        className="mb-6 h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {visible ? "Esconder Produtos" : "Mostrar Produtos"}
      </button>

      {visible && (
        products.length === 0 ? (
          <p className="text-zinc-500">Nenhum produto encontrado.</p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {paginated.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-medium text-black dark:text-white">
                      {product.nome}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">{product.id}</span>
                  </div>

                  <div className="flex items-center gap-8 text-sm">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-zinc-400">Preço</span>
                      <span className="font-semibold text-black dark:text-white">
                        R$ {Number(product.preco).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-zinc-400">Estoque</span>
                      <span className={`font-semibold ${product.quantidade === 0 ? "text-red-500" : "text-black dark:text-white"}`}>
                        {product.quantidade}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-zinc-400">
                  Página {page} de {totalPages} — {products.length} produtos
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Próxima →
                  </button>

                  
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

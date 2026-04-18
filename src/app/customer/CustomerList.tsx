"use client";
import { useState } from "react";
import Link from "next/link";

type CustomerData = {
  id: string;
  nome: string;
  email: string;
  endereco: string;
  cep: string;
  cpf: string;
};

const PAGE_SIZE = 5;

export default function CustomerList({ customers }: { customers: CustomerData[] }) {
  const [visible, setVisible] = useState(true);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(customers.length / PAGE_SIZE);
  const paginated = customers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        {visible ? "Esconder Clientes" : "Mostrar Clientes"}
      </button>

      {visible && (
        customers.length === 0 ? (
          <p className="text-zinc-500">Nenhum cliente cadastrado.</p>
        ) : (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-zinc-400 uppercase">Nome</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-zinc-400 uppercase">Email</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-zinc-400 uppercase">Endereço</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-zinc-400 uppercase">CEP</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-zinc-400 uppercase">CPF</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((customer) => (
                    <tr key={customer.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="py-3 px-4 text-sm font-medium text-black dark:text-white">{customer.nome}</td>
                      <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">{customer.email}</td>
                      <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">{customer.endereco}</td>
                      <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">{customer.cep}</td>
                      <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">{customer.cpf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-zinc-400">
                  Página {page} de {totalPages} — {customers.length} clientes
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

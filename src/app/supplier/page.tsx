import { supplierRepository } from "@/server/container";
import { Role } from "@/domain/entities/user";
import { requirePage } from "@/lib/pageGuards";
import Link from "next/link";

// Expõe e-mail e telefone de todos os fornecedores: restrito ao admin.
export default async function SupplierPage() {
  await requirePage(Role.ADMIN);

  const suppliers = await supplierRepository.findAll();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-black dark:text-white">Fornecedores</h1>
          <div className="flex gap-3">
            <Link
              href="/supplier/new"
              className="h-10 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium flex items-center transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              + Novo Fornecedor
            </Link>
            <Link
              href="/"
              className="h-10 px-5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Home
            </Link>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <p className="text-zinc-500">Nenhum fornecedor cadastrado.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-base font-medium text-black dark:text-white">{supplier.razaoSocial}</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{supplier.email}</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{supplier.endereco}</span>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Telefone</span>
                    <span className="font-medium text-black dark:text-white">{supplier.telefone}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Coordenadas</span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{supplier.latitude}, {supplier.longitude}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

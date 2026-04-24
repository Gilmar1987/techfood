import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SupplierDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Tech<span className="text-orange-500">Food</span>
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Painel do Fornecedor · {session.user.email}</p>
          </div>
          <Link href="/api/auth/signout?callbackUrl=/"
            className="h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 flex items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Sair
          </Link>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/products/manage"
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow rounded-2xl p-6 flex flex-col gap-3">
            <span className="text-3xl">🍔</span>
            <h2 className="text-lg font-semibold text-black dark:text-white">Meus Produtos</h2>
            <p className="text-sm text-zinc-500">Cadastre, edite e controle o estoque.</p>
          </Link>

          <Link href="/orders/fornecedor"
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow rounded-2xl p-6 flex flex-col gap-3">
            <span className="text-3xl">📋</span>
            <h2 className="text-lg font-semibold text-black dark:text-white">Pedidos Recebidos</h2>
            <p className="text-sm text-zinc-500">Gerencie pedidos pagos e em andamento.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

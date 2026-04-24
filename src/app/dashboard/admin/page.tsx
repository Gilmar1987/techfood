import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const sections = [
  { icon: "👤", title: "Clientes", href: "/customer", desc: "Visualize e gerencie todos os clientes." },
  { icon: "🏭", title: "Fornecedores", href: "/supplier", desc: "Visualize e gerencie todos os fornecedores." },
  { icon: "🍔", title: "Produtos", href: "/products/manage", desc: "Gerencie produtos de qualquer fornecedor." },
  { icon: "📦", title: "Pedidos", href: "/orders/manage", desc: "Visualize e administre todos os pedidos." },
  { icon: "🛒", title: "Novo Pedido", href: "/orders/new", desc: "Crie um pedido manualmente." },
  { icon: "📋", title: "Pedidos por Fornecedor", href: "/orders/fornecedor", desc: "Gerencie pedidos por fornecedor." },
];

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Tech<span className="text-orange-500">Food</span>
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Painel Administrativo · {session.user.email}</p>
          </div>
          <Link href="/api/auth/signout?callbackUrl=/"
            className="h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 flex items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Sair
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sections.map((s) => (
            <Link key={s.href} href={s.href}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow rounded-2xl p-6 flex flex-col gap-3">
              <span className="text-3xl">{s.icon}</span>
              <h2 className="text-base font-semibold text-black dark:text-white">{s.title}</h2>
              <p className="text-sm text-zinc-500">{s.desc}</p>
            </Link>
          ))}
        </div>

        {/* Criar admin */}
        <div className="mt-8 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Criar usuário admin</h2>
          <p className="text-xs text-zinc-400 mb-3">Use o endpoint abaixo via POST para criar novos admins.</p>
          <code className="text-xs bg-zinc-200 dark:bg-zinc-800 px-3 py-2 rounded-lg block text-zinc-700 dark:text-zinc-300">
            POST /api/admin/seed {"{ email, password }"}
          </code>
        </div>
      </div>
    </main>
  );
}

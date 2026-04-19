import Link from "next/link";

const features = [
  {
    icon: "🍔",
    title: "Gestão de Produtos",
    description: "Cadastre, edite e controle o estoque dos seus produtos com facilidade.",
    href: "/products",
  },
  {
    icon: "👤",
    title: "Gestão de Clientes",
    description: "Gerencie seus clientes e mantenha um histórico completo de pedidos.",
    href: "/customers",
  },
  {
    icon: "📦",
    title: "Gestão de Pedidos",
    description: "Acompanhe pedidos em tempo real, do recebimento à entrega.",
    href: "/orders",
  },
];

const stack = [
  { label: "Next.js 16", color: "bg-black text-white dark:bg-white dark:text-black" },
  { label: "TypeScript", color: "bg-blue-600 text-white" },
  { label: "PostgreSQL", color: "bg-blue-400 text-white" },
  { label: "Prisma ORM", color: "bg-zinc-700 text-white" },
  { label: "Clean Architecture", color: "bg-green-600 text-white" },
  { label: "DDD", color: "bg-purple-600 text-white" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
        <div className="text-6xl mb-6">🍕</div>
        <h1 className="text-5xl font-bold tracking-tight text-black dark:text-white mb-4">
          Tech<span className="text-orange-500">Food</span>
        </h1>
        <p className="max-w-xl text-lg text-zinc-500 dark:text-zinc-400 mb-10">
          Sistema de gestão de pedidos para restaurantes e food services.
          Construído com Clean Architecture e Domain-Driven Design.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products/new"
            className="h-11 px-6 rounded-full bg-orange-500 text-white text-sm font-semibold transition-colors hover:bg-orange-600"
          >
            + Cadastrar Produto
          </Link>
          <Link
            href="/customer/new"
            className="h-11 px-6 rounded-full bg-orange-500 text-white text-sm font-semibold transition-colors hover:bg-orange-600"
          >
            + Cadastrar Cliente
          </Link>
          <Link
            href="/orders/new"
            className="h-11 px-6 rounded-full bg-orange-500 text-white text-sm font-semibold transition-colors hover:bg-orange-600"
          >
            + Novo Pedido
          </Link>
          <Link
            href="/products"
            className="h-11 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Ver Produtos
          </Link>
          <Link
            href="/orders"
            className="h-11 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Ver Pedidos
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-semibold text-black dark:text-white text-center mb-12">
          O que você pode gerenciar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3 transition-shadow hover:shadow-md"
            >
              <span className="text-4xl">{f.icon}</span>
              <h3 className="text-base font-semibold text-black dark:text-white">{f.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section className="border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-6 py-16">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Tecnologias
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {stack.map((s) => (
              <span
                key={s.label}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold ${s.color}`}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900 px-6 py-8 text-center text-xs text-zinc-400">
        TechFood © {new Date().getFullYear()} — Desenvolvido com Next.js, Clean Architecture e DDD
      </footer>

    </main>
  );
}

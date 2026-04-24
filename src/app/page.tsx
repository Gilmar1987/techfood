import Link from "next/link";

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
          Peça comida, gerencie seu restaurante ou administre a plataforma.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Card Customer */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center gap-4">
            <span className="text-4xl">👤</span>
            <h2 className="text-lg font-semibold text-black dark:text-white">Sou Cliente</h2>
            <p className="text-sm text-zinc-500 text-center">Faça pedidos e acompanhe suas entregas.</p>
            <Link href="/login?mode=cpf" className="w-full h-10 rounded-full bg-orange-500 text-white text-sm font-semibold flex items-center justify-center hover:bg-orange-600 transition-colors">
              Entrar com CPF
            </Link>
            <Link href="/customer/new" className="text-sm text-orange-500 font-medium hover:underline">
              Criar conta de cliente
            </Link>
          </div>

          {/* Card Supplier */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center gap-4">
            <span className="text-4xl">🏭</span>
            <h2 className="text-lg font-semibold text-black dark:text-white">Sou Fornecedor</h2>
            <p className="text-sm text-zinc-500 text-center">Gerencie produtos e pedidos do seu restaurante.</p>
            <Link href="/login?mode=cnpj" className="w-full h-10 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
              Entrar com CNPJ
            </Link>
            <Link href="/supplier/new" className="text-sm text-zinc-500 font-medium hover:underline">
              Cadastrar restaurante
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-zinc-400">
          Administrador?{" "}
          <Link href="/login?mode=admin" className="text-zinc-500 hover:underline">
            Acesse aqui
          </Link>
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900 px-6 py-8 text-center text-xs text-zinc-400">
        TechFood © {new Date().getFullYear()} — Desenvolvido com Next.js, Clean Architecture e DDD
      </footer>
    </main>
  );
}

import { customerRepository } from "@/server/container";
import Link from "next/link";
import CustomerList from "./CustomerList";

export default async function CustomerPage() {
  const customers = await customerRepository.findAll();

  const serialized = customers.map((c) => ({
    id: c.id,
    nome: c.nome,
    email: c.email,
    endereco: c.endereco,
    cep: c.cep,
    cpf: c.cpf,
    telefone: c.telefone,
  }));

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-black dark:text-white">
            Clientes
          </h1>
          <div className="flex gap-3">
            <Link
              href="/customer/new"
              className="h-10 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium flex items-center transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              + Novo Cliente
            </Link>
            <Link
              href="/"
              className="h-10 px-5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Home
            </Link>
          </div>
        </div>

        <CustomerList customers={serialized} />
      </div>
    </main>
  );
}

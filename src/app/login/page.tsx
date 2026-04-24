"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Mode = "cpf" | "cnpj" | "admin";

const MODE_LABELS: Record<Mode, string> = { cpf: "Cliente (CPF)", cnpj: "Fornecedor (CNPJ)", admin: "Admin (Email)" };
const ROLE_REDIRECT: Record<string, string> = { CUSTOMER: "/dashboard/customer", SUPPLIER: "/dashboard/supplier", ADMIN: "/dashboard/admin" };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>((searchParams.get("mode") as Mode) ?? "cpf");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const m = searchParams.get("mode") as Mode;
    if (m && ["cpf", "cnpj", "admin"].includes(m)) setMode(m);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      cpf: mode === "cpf" ? identifier.replace(/\D/g, "") : undefined,
      cnpj: mode === "cnpj" ? identifier.replace(/\D/g, "") : undefined,
      email: mode === "admin" ? identifier.trim() : undefined,
      password,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Credenciais inválidas.");
      return;
    }

    // Buscar sessão para saber o role e redirecionar
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role: string = session?.user?.role ?? "";
    router.push(ROLE_REDIRECT[role] ?? "/");
    router.refresh();
  }

  const inputClass = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-orange-400 w-full";

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🍕</span>
          <h1 className="text-3xl font-bold text-black dark:text-white mt-3">
            Tech<span className="text-orange-500">Food</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Acesse sua conta</p>
        </div>

        {/* Toggle de modo */}
        <div className="flex rounded-full border border-zinc-200 dark:border-zinc-700 p-1 mb-6">
          {(["cpf", "cnpj", "admin"] as Mode[]).map((m) => (
            <button key={m} type="button"
              onClick={() => { setMode(m); setIdentifier(""); setError(""); }}
              className={`flex-1 h-8 rounded-full text-xs font-medium transition-colors ${mode === m ? "bg-orange-500 text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {mode === "cpf" ? "CPF" : mode === "cnpj" ? "CNPJ" : "Email"}
            </label>
            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              placeholder={mode === "cpf" ? "000.000.000-00" : mode === "cnpj" ? "00.000.000/0000-00" : "admin@techfood.com"}
              required className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="h-10 rounded-full bg-orange-500 text-white text-sm font-semibold transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {mode === "cpf" && (
          <p className="text-center text-sm text-zinc-500 mt-4">
            Não tem conta?{" "}
            <Link href="/customer/new" className="text-orange-500 font-medium hover:underline">Cadastre-se como cliente</Link>
          </p>
        )}
        {mode === "cnpj" && (
          <p className="text-center text-sm text-zinc-500 mt-4">
            Não tem conta?{" "}
            <Link href="/supplier/new" className="text-orange-500 font-medium hover:underline">Cadastre-se como fornecedor</Link>
          </p>
        )}

        <p className="text-center mt-3">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600">Voltar para Home</Link>
        </p>
      </div>
    </main>
  );
}

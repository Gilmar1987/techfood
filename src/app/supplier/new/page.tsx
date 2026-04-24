"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type GeoStatus = "idle" | "loading" | "found" | "not_found" | "manual";

export default function NewSupplierPage() {
  const router = useRouter();
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputClass = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-zinc-400";

  async function handleCepBlur() {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;

    setGeoStatus("loading");
    setLatitude("");
    setLongitude("");

    try {
      const res = await fetch(`/api/geo?cep=${clean}`);
      if (res.ok) {
        const data = await res.json();
        setLatitude(String(data.latitude));
        setLongitude(String(data.longitude));
        setGeoStatus("found");
      } else {
        setGeoStatus("not_found");
      }
    } catch {
      setGeoStatus("not_found");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razaoSocial, cnpj, cep, endereco, telefone, email, password,
          latitude: latitude !== "" ? Number(latitude) : undefined,
          longitude: longitude !== "" ? Number(longitude) : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create supplier");

      setSuccess(true);
      setTimeout(() => router.push("/supplier"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-semibold text-black dark:text-white mb-8">Novo Fornecedor</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">

          {[
            { id: "razaoSocial", label: "Razão Social", value: razaoSocial, set: setRazaoSocial, type: "text", placeholder: "Nome da empresa" },
            { id: "cnpj", label: "CNPJ", value: cnpj, set: setCnpj, type: "text", placeholder: "00.000.000/0000-00" },
            { id: "telefone", label: "Telefone", value: telefone, set: setTelefone, type: "tel", placeholder: "(00) 00000-0000" },
            { id: "email", label: "Email", value: email, set: setEmail, type: "email", placeholder: "contato@empresa.com" },
            { id: "password", label: "Senha", value: password, set: setPassword, type: "password", placeholder: "••••••••" },
            { id: "endereco", label: "Endereço", value: endereco, set: setEndereco, type: "text", placeholder: "Rua, número, cidade" },
          ].map((field) => (
            <div key={field.id} className="flex flex-col gap-1">
              <label htmlFor={field.id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{field.label}</label>
              <input id={field.id} type={field.type} value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder} required className={inputClass} />
            </div>
          ))}

          {/* CEP com busca automática */}
          <div className="flex flex-col gap-1">
            <label htmlFor="cep" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">CEP</label>
            <input
              id="cep" type="text" value={cep}
              onChange={(e) => { setCep(e.target.value); setGeoStatus("idle"); }}
              onBlur={handleCepBlur}
              placeholder="00000-000" required className={inputClass}
            />
            {geoStatus === "loading" && <p className="text-xs text-zinc-400">Buscando coordenadas...</p>}
            {geoStatus === "found" && <p className="text-xs text-green-600">✓ Coordenadas encontradas automaticamente</p>}
            {geoStatus === "not_found" && <p className="text-xs text-yellow-600">Coordenadas não encontradas. Preencha manualmente abaixo.</p>}
          </div>

          {/* Coordenadas — preenchidas automaticamente ou manualmente */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="latitude" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Latitude {geoStatus === "found" && <span className="text-xs text-green-500">(auto)</span>}
              </label>
              <input
                id="latitude" type="number" step="any" value={latitude}
                onChange={(e) => { setLatitude(e.target.value); setGeoStatus("manual"); }}
                placeholder="-23.5505"
                readOnly={geoStatus === "found"}
                className={`${inputClass} ${geoStatus === "found" ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="longitude" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Longitude {geoStatus === "found" && <span className="text-xs text-green-500">(auto)</span>}
              </label>
              <input
                id="longitude" type="number" step="any" value={longitude}
                onChange={(e) => { setLongitude(e.target.value); setGeoStatus("manual"); }}
                placeholder="-46.6333"
                readOnly={geoStatus === "found"}
                className={`${inputClass} ${geoStatus === "found" ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          {geoStatus === "found" && (
            <button type="button" onClick={() => setGeoStatus("manual")}
              className="text-xs text-zinc-400 hover:text-zinc-600 text-left">
              Editar coordenadas manualmente
            </button>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">Fornecedor criado com sucesso! Redirecionando...</p>}

          <button type="submit" disabled={loading}
            className="h-10 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Criando..." : "Criar Fornecedor"}
          </button>
        </form>

        <div className="flex gap-3 mt-4">
          <Link href="/supplier" className="h-11 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center">
            Ver Todos
          </Link>
          <Link href="/" className="h-11 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center">
            Voltar para Home
          </Link>
        </div>
      </div>
    </main>
  );
}

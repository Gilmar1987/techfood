import { createSupplierUseCase, supplierRepository } from "@/server/container";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cnpj = searchParams.get("cnpj");

    if (cnpj) {
      const sanitized = cnpj.replace(/[\D]/g, "");
      if (sanitized.length !== 14) {
        return NextResponse.json({ error: "Invalid CNPJ format" }, { status: 400 });
      }
      const supplier = await supplierRepository.findByCNPJ(sanitized);
      if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
      return NextResponse.json(supplier, { status: 200 });
    }

    const suppliers = await supplierRepository.findAll();
    const serialized = suppliers.map((s) => ({
      id: s.id,
      razaoSocial: s.razaoSocial,
      cnpj: s.cnpj,
      cep: s.cep,
      endereco: s.endereco,
      telefone: s.telefone,
      email: s.email,
      latitude: s.latitude,
      longitude: s.longitude,
    }));
    return NextResponse.json(serialized, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const razaoSocial = typeof body.razaoSocial === "string" ? body.razaoSocial.trim() : "";
    const cnpj = typeof body.cnpj === "string" ? body.cnpj.replace(/[\D]/g, "") : "";
    const cep = typeof body.cep === "string" ? body.cep.replace(/[\D]/g, "") : "";
    const endereco = typeof body.endereco === "string" ? body.endereco.trim().replace(/[^a-zA-Z\u00C0-\u00FF0-9\s,.-]/g, "") : "";
    const telefone = typeof body.telefone === "string" ? body.telefone.replace(/[\D]/g, "") : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "") : "";
    const password = typeof body.password === "string" ? body.password : "";
    const latitude = body.latitude !== undefined && body.latitude !== "" ? Number(body.latitude) : undefined;
    const longitude = body.longitude !== undefined && body.longitude !== "" ? Number(body.longitude) : undefined;

    if (!razaoSocial || !cnpj || !cep || !endereco || !telefone || !email || !password) {
      return NextResponse.json({ error: "All fields are required and must be valid" }, { status: 400 });
    }

    const supplier = await createSupplierUseCase.execute({ razaoSocial, cnpj, cep, endereco, telefone, email, password, latitude, longitude });
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

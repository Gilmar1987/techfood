import { createCustomerUseCase, customerRepository } from "@/server/container";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf");

    if (!cpf || typeof cpf !== "string" || cpf.trim() === "") {
      return NextResponse.json({ error: "CPF is required" }, { status: 400 });
    }

    const sanitizedCpf = cpf.trim().replace(/[^\d]/g, "");

    if (sanitizedCpf.length !== 11) {
      return NextResponse.json({ error: "Invalid CPF format" }, { status: 400 });
    }

    const customer = await customerRepository.findByCPF(sanitizedCpf);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const id = typeof body.id === "string" ? body.id.trim() : "";
    const endereco = typeof body.endereco === "string" ? body.endereco.trim().replace(/[^a-zA-Z\u00C0-\u00FF0-9\s,.-]/g, "") : "";
    const cep = typeof body.cep === "string" ? body.cep.trim().replace(/[^\d-]/g, "") : "";

    if (!id || !endereco || !cep) {
      return NextResponse.json({ error: "id, endereco and cep are required" }, { status: 400 });
    }

    const existing = await customerRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const { Customer } = await import("@/domain/entities/Customer");
    const updated = new Customer(
      existing.id, existing.nome, existing.email, endereco, cep,
      existing.cpf, existing.telefone, existing.createdAt, new Date(), existing.deletedAt
    );
    await customerRepository.update(updated);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const nome = typeof body.nome === "string" ? body.nome.trim().replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, "") : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "") : "";
    const endereco = typeof body.endereco === "string" ? body.endereco.trim().replace(/[^a-zA-Z\u00C0-\u00FF0-9\s,.-]/g, "") : "";
    const cep = typeof body.cep === "string" ? body.cep.trim().replace(/[^\d-]/g, "") : "";
    const cpf = typeof body.cpf === "string" ? body.cpf.trim().replace(/[^\d]/g, "") : "";
    const telefone = typeof body.telefone === "string" ? body.telefone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!nome || !email || !endereco || !cep || !cpf || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const customer = await createCustomerUseCase.execute({ nome, email, endereco, cep, cpf, telefone, password });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

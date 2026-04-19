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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const endereco = typeof body.endereco === "string" ? body.endereco.trim() : "";
    const cep = typeof body.cep === "string" ? body.cep.trim() : "";
    const cpf = typeof body.cpf === "string" ? body.cpf.trim().replace(/[^\d]/g, "") : "";

    if (!nome || !email || !endereco || !cep || !cpf) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const customer = await createCustomerUseCase.execute({ nome, email, endereco, cep, cpf });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

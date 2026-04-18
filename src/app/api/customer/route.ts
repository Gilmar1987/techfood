import { createCustomerUseCase } from "@/server/container";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, endereco, cep, cpf } = body;

    if (!nome || !email || !endereco || !cep || !cpf) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const customer = await createCustomerUseCase.execute({
      nome: String(nome),
      email: String(email),
      endereco: String(endereco),
      cep: String(cep),
      cpf: String(cpf),
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

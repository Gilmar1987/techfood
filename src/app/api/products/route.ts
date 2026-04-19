import { createProductUseCase, productRepository } from '@/server/container';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await productRepository.findAll();
    const serialized = products.map((p) => ({
      id: p.id,
      nome: p.nome,
      preco: p.preco,
      quantidade: p.quantidade,
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

    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const preco = Number(body.preco);
    const quantidade = Number(body.quantidade);

    if (!nome || isNaN(preco) || preco < 0 || isNaN(quantidade) || quantidade < 0) {
      return NextResponse.json({ error: "All fields are required and must be valid" }, { status: 400 });
    }

    await createProductUseCase.execute({ nome, preco, quantidade });

    return NextResponse.json({ message: "Product created successfully" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

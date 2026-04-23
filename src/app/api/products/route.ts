import { createProductUseCase, productRepository } from '@/server/container';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");

    const products = supplierId
      ? await productRepository.findBySupplierId(supplierId)
      : await productRepository.findAll();

    const serialized = products.map((p) => ({
      id: p.id,
      nome: p.nome,
      preco: p.preco,
      quantidade: p.quantidade,
      supplierId: p.supplierId,
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
    const supplierId = typeof body.supplierId === "string" ? body.supplierId.trim() : "";
    if (!nome || isNaN(preco) || preco < 0 || isNaN(quantidade) || quantidade < 0 || !supplierId) {
      return NextResponse.json({ error: "All fields are required and must be valid" }, { status: 400 });
    }
    await createProductUseCase.execute({ nome, preco, quantidade, supplierId });
    return NextResponse.json({ message: "Product created successfully" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const preco = Number(body.preco);
    const quantidade = Number(body.quantidade);
    const supplierId = typeof body.supplierId === "string" ? body.supplierId.trim() : "";
    if (!id || !nome || isNaN(preco) || preco < 0 || isNaN(quantidade) || quantidade < 0 || !supplierId) {
      return NextResponse.json({ error: "All fields are required and must be valid" }, { status: 400 });
    }
    const existing = await productRepository.findById(id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const updated = new (await import("@/domain/entities/Product")).Product(
      id, nome, preco, quantidade, supplierId, existing.createdAt, new Date(), existing.deletedAt
    );
    await productRepository.update(updated);
    return NextResponse.json({ message: "Product updated successfully" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim() ?? "";
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const existing = await productRepository.findById(id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    await productRepository.softDelete(id);
    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
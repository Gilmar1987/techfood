import { createOrderUseCase } from "@/server/container";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
    }

    const items = body.items.map((item: unknown) => {
      if (!item || typeof item !== "object") throw new Error("Invalid item");
      const i = item as Record<string, unknown>;
      const productId = typeof i.productId === "string" ? i.productId.trim() : "";
      const quantidade = Number(i.quantidade);
      if (!productId || isNaN(quantidade) || quantidade <= 0) throw new Error("Invalid item fields");
      return { productId, quantidade };
    });

    const order = await createOrderUseCase.execute({ customerId, items });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

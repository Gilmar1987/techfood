import { createOrderUseCase } from "@/server/container";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerId || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const order = await createOrderUseCase.execute({
      customerId: String(body.customerId),
      items: body.items.map((item: any) => ({
        productId: String(item.productId),
        quantidade: Number(item.quantidade),
      })),
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  
}

import { updateOrderStatusUseCase } from "@/server/container";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = z.string().uuid().parse(id);

    await updateOrderStatusUseCase.cancel(orderId);

    return NextResponse.json({ message: "Pedido cancelado com sucesso" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("não encontrado") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

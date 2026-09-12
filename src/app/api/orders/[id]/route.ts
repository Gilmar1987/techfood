import { updateOrderStatusUseCase } from "@/server/container";
import { NextResponse } from "next/server";
import { Actor } from "@/domain/entities/user";
import { requireSession, errorResponse, HttpError } from "@/lib/requireSession";
import { isUuid } from "@/lib/validation";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const actor: Actor = {
      role: user.role,
      customerId: user.customerId,
      supplierId: user.supplierId,
    };

    const { id } = await params;
    if (!isUuid(id)) {
      throw new HttpError(400, "id deve ser um UUID válido");
    }

    await updateOrderStatusUseCase.cancel(id, actor);

    return NextResponse.json({ message: "Pedido cancelado com sucesso" }, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

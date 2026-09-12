import { NextResponse } from "next/server";
import { quoteFreteUseCase } from "@/server/container";
import { requireSession, errorResponse, HttpError } from "@/lib/requireSession";
import { isUuid } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    await requireSession();

    const { searchParams } = new URL(request.url);
    const cep = searchParams.get("cep")?.replace(/\D/g, "") ?? "";
    const supplierId = searchParams.get("supplierId")?.trim() ?? "";

    if (cep.length !== 8) {
      throw new HttpError(400, "CEP inválido");
    }
    if (!isUuid(supplierId)) {
      throw new HttpError(400, "supplierId deve ser um UUID válido");
    }

    const quote = await quoteFreteUseCase.execute(cep, supplierId);
    return NextResponse.json(quote, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

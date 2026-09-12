import { createProductUseCase, productRepository } from "@/server/container";
import { NextResponse } from "next/server";
import { Product } from "@/domain/entities/Product";
import { Role } from "@/domain/entities/user";
import {
  requireSession,
  errorResponse,
  isAdmin,
  HttpError,
  SessionUser,
} from "@/lib/requireSession";
import { isUuid } from "@/lib/validation";

/** Produto que existe mas é de outro fornecedor responde 404: não confirma o id. */
async function findOwnedProduct(user: SessionUser, id: string) {
  const existing = await productRepository.findById(id);
  if (!existing) throw new HttpError(404, "Produto não encontrado");
  if (!isAdmin(user) && existing.supplierId !== user.supplierId) {
    throw new HttpError(404, "Produto não encontrado");
  }
  return existing;
}

/** O fornecedor dono da escrita: da sessão para SUPPLIER, do corpo só para ADMIN. */
function resolveSupplierId(user: SessionUser, bodySupplierId: unknown): string {
  if (isAdmin(user)) {
    const id = typeof bodySupplierId === "string" ? bodySupplierId.trim() : "";
    if (!isUuid(id)) throw new HttpError(400, "supplierId deve ser um UUID válido");
    return id;
  }
  if (!user.supplierId) throw new HttpError(403, "Usuário não está vinculado a um fornecedor");
  return user.supplierId;
}

/**
 * Vitrine: qualquer usuário autenticado consulta o catálogo de qualquer
 * fornecedor — é o que sustenta o marketplace. O fornecedor, porém, só
 * enxerga o próprio catálogo, que é o que a tela de gestão precisa.
 */
export async function GET(request: Request) {
  try {
    const user = await requireSession();

    const { searchParams } = new URL(request.url);
    const requested = searchParams.get("supplierId")?.trim() ?? "";

    const supplierId =
      user.role === Role.SUPPLIER ? (user.supplierId ?? "") : requested;

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
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(Role.SUPPLIER, Role.ADMIN);

    const body = await request.json();
    if (!body || typeof body !== "object") {
      throw new HttpError(400, "Corpo da requisição inválido");
    }

    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const preco = Number(body.preco);
    const quantidade = Number(body.quantidade);
    const supplierId = resolveSupplierId(user, body.supplierId);

    if (!nome || isNaN(preco) || preco < 0 || isNaN(quantidade) || quantidade < 0) {
      throw new HttpError(400, "Todos os campos são obrigatórios e devem ser válidos");
    }

    await createProductUseCase.execute({ nome, preco, quantidade, supplierId });
    return NextResponse.json({ message: "Product created successfully" }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireSession(Role.SUPPLIER, Role.ADMIN);

    const body = await request.json();
    if (!body || typeof body !== "object") {
      throw new HttpError(400, "Corpo da requisição inválido");
    }

    const id = typeof body.id === "string" ? body.id.trim() : "";
    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const preco = Number(body.preco);
    const quantidade = Number(body.quantidade);

    if (!isUuid(id) || !nome || isNaN(preco) || preco < 0 || isNaN(quantidade) || quantidade < 0) {
      throw new HttpError(400, "Todos os campos são obrigatórios e devem ser válidos");
    }

    const existing = await findOwnedProduct(user, id);

    // O fornecedor do produto não muda em um update — nunca vem do corpo.
    const updated = new Product(
      id, nome, preco, quantidade, existing.supplierId,
      existing.createdAt, new Date(), existing.deletedAt
    );
    await productRepository.update(updated);
    return NextResponse.json({ message: "Product updated successfully" }, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireSession(Role.SUPPLIER, Role.ADMIN);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim() ?? "";
    if (!isUuid(id)) throw new HttpError(400, "id deve ser um UUID válido");

    await findOwnedProduct(user, id);
    await productRepository.softDelete(id);

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

import { createSupplierUseCase, supplierRepository } from "@/server/container";
import { NextResponse } from "next/server";
import { requireSession, errorResponse, isAdmin, HttpError } from "@/lib/requireSession";

/**
 * Vitrine: o cliente precisa ver todos os fornecedores para escolher de quem
 * comprar. Mas CNPJ, e-mail e telefone não têm função nessa tela — só o admin
 * e o próprio fornecedor recebem o cadastro completo.
 */
export async function GET(request: Request) {
  try {
    const user = await requireSession();

    const { searchParams } = new URL(request.url);
    const cnpj = searchParams.get("cnpj");

    if (cnpj) {
      const sanitized = cnpj.replace(/[\D]/g, "");
      if (sanitized.length !== 14) {
        throw new HttpError(400, "CNPJ inválido");
      }
      if (!isAdmin(user) && user.cnpj !== sanitized) {
        throw new HttpError(404, "Fornecedor não encontrado");
      }
      const supplier = await supplierRepository.findByCNPJ(sanitized);
      if (!supplier) throw new HttpError(404, "Fornecedor não encontrado");
      return NextResponse.json(supplier, { status: 200 });
    }

    const suppliers = await supplierRepository.findAll();
    const serialized = suppliers.map((s) =>
      isAdmin(user)
        ? {
            id: s.id,
            razaoSocial: s.razaoSocial,
            cnpj: s.cnpj,
            cep: s.cep,
            endereco: s.endereco,
            telefone: s.telefone,
            email: s.email,
            latitude: s.latitude,
            longitude: s.longitude,
          }
        : {
            id: s.id,
            razaoSocial: s.razaoSocial,
            endereco: s.endereco,
            latitude: s.latitude,
            longitude: s.longitude,
          }
    );
    return NextResponse.json(serialized, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Público: é o cadastro de novos fornecedores, não há sessão ainda. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      throw new HttpError(400, "Corpo da requisição inválido");
    }

    const razaoSocial = typeof body.razaoSocial === "string" ? body.razaoSocial.trim() : "";
    const cnpj = typeof body.cnpj === "string" ? body.cnpj.replace(/[\D]/g, "") : "";
    const cep = typeof body.cep === "string" ? body.cep.replace(/[\D]/g, "") : "";
    const endereco = typeof body.endereco === "string" ? body.endereco.trim().replace(/[^a-zA-ZÀ-ÿ0-9\s,.-]/g, "") : "";
    const telefone = typeof body.telefone === "string" ? body.telefone.replace(/[\D]/g, "") : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "") : "";
    const password = typeof body.password === "string" ? body.password : "";
    const latitude = body.latitude !== undefined && body.latitude !== "" ? Number(body.latitude) : undefined;
    const longitude = body.longitude !== undefined && body.longitude !== "" ? Number(body.longitude) : undefined;

    if (!razaoSocial || !cnpj || !cep || !endereco || !telefone || !email || !password) {
      throw new HttpError(400, "Todos os campos são obrigatórios e devem ser válidos");
    }

    const supplier = await createSupplierUseCase.execute({
      razaoSocial, cnpj, cep, endereco, telefone, email, password, latitude, longitude,
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

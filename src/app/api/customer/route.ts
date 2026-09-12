import { createCustomerUseCase, customerRepository } from "@/server/container";
import { NextResponse } from "next/server";
import { Customer } from "@/domain/entities/Customer";
import { Role } from "@/domain/entities/user";
import { requireSession, errorResponse, isAdmin, HttpError } from "@/lib/requireSession";

export async function GET(request: Request) {
  try {
    const user = await requireSession(Role.CUSTOMER, Role.ADMIN);

    const { searchParams } = new URL(request.url);
    const requested = searchParams.get("cpf")?.trim().replace(/[^\d]/g, "") ?? "";

    // Admin consulta qualquer CPF; cliente enxerga apenas o próprio — o
    // parâmetro da URL é descartado para quem não é admin.
    const cpf = isAdmin(user) ? requested : (user.cpf ?? "");

    if (cpf.length !== 11) {
      throw new HttpError(400, "CPF inválido");
    }

    const customer = await customerRepository.findByCPF(cpf);
    if (!customer) {
      throw new HttpError(404, "Cliente não encontrado");
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSession(Role.CUSTOMER, Role.ADMIN);

    const body = await request.json();
    if (!body || typeof body !== "object") {
      throw new HttpError(400, "Corpo da requisição inválido");
    }

    const endereco = typeof body.endereco === "string" ? body.endereco.trim().replace(/[^a-zA-ZÀ-ÿ0-9\s,.-]/g, "") : "";
    const cep = typeof body.cep === "string" ? body.cep.trim().replace(/[^\d-]/g, "") : "";

    // O cliente só altera o próprio cadastro: o id vem da sessão, não do corpo.
    const id = isAdmin(user)
      ? (typeof body.id === "string" ? body.id.trim() : "")
      : (user.customerId ?? "");

    if (!id || !endereco || !cep) {
      throw new HttpError(400, "id, endereco e cep são obrigatórios");
    }

    const existing = await customerRepository.findById(id);
    if (!existing) {
      throw new HttpError(404, "Cliente não encontrado");
    }

    const updated = new Customer(
      existing.id, existing.nome, existing.email, endereco, cep,
      existing.cpf, existing.telefone, existing.createdAt, new Date(), existing.deletedAt
    );
    await customerRepository.update(updated);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Público: é o cadastro de novos clientes, não há sessão ainda. */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      throw new HttpError(400, "Corpo da requisição inválido");
    }

    const nome = typeof body.nome === "string" ? body.nome.trim().replace(/[^a-zA-ZÀ-ÿ\s]/g, "") : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "") : "";
    const endereco = typeof body.endereco === "string" ? body.endereco.trim().replace(/[^a-zA-ZÀ-ÿ0-9\s,.-]/g, "") : "";
    const cep = typeof body.cep === "string" ? body.cep.trim().replace(/[^\d-]/g, "") : "";
    const cpf = typeof body.cpf === "string" ? body.cpf.trim().replace(/[^\d]/g, "") : "";
    const telefone = typeof body.telefone === "string" ? body.telefone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!nome || !email || !endereco || !cep || !cpf || !password) {
      throw new HttpError(400, "Todos os campos são obrigatórios");
    }

    const customer = await createCustomerUseCase.execute({ nome, email, endereco, cep, cpf, telefone, password });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@/domain/entities/user";
import { BusinessRuleError, NotFoundError } from "@/domain/errors";

/** Erro com status HTTP explícito, para ser convertido em resposta por `errorResponse`. */
export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export type SessionUser = {
  id: string;
  email?: string | null;
  role?: Role;
  cpf?: string;
  cnpj?: string;
  customerId?: string;
  supplierId?: string;
};

/**
 * Garante que existe uma sessão ativa e, quando `roles` é informado, que o perfil
 * do usuário está na lista. Lança `HttpError` — use com `errorResponse` no catch.
 */
export async function requireSession(...roles: Role[]): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) {
    throw new HttpError(401, "Não autenticado");
  }

  const user = session.user as SessionUser;

  if (roles.length > 0 && (!user.role || !roles.includes(user.role))) {
    throw new HttpError(403, "Acesso negado");
  }

  return user;
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === Role.ADMIN;
}

/**
 * Recurso que existe mas não pertence ao usuário responde 404, e não 403,
 * para não confirmar a existência do id a quem não tem acesso.
 */
export function notFound(message = "Recurso não encontrado"): HttpError {
  return new HttpError(404, message);
}

/**
 * Converte um erro em resposta HTTP. Só mensagens de `HttpError` chegam ao
 * cliente; erros inesperados viram 500 genérico e ficam no log do servidor.
 */
export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof BusinessRuleError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

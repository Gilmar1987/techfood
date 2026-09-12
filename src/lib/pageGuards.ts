import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Role } from "@/domain/entities/user";
import { SessionUser } from "@/lib/requireSession";

/**
 * Guarda de páginas (Server Components). Equivale ao `requireSession` das rotas
 * de API, mas redireciona em vez de responder com erro.
 *
 * O `proxy.ts` cobre apenas `/dashboard` e, segundo a própria documentação do
 * Next, não deve ser usado como fronteira de autorização — a verificação real
 * precisa acontecer aqui, onde os dados são lidos.
 */
export async function requirePage(...roles: Role[]): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as SessionUser;
  if (roles.length > 0 && (!user.role || !roles.includes(user.role))) {
    redirect("/login");
  }

  return user;
}

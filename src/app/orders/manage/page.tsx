import { Role } from "@/domain/entities/user";
import { requirePage } from "@/lib/pageGuards";
import ManageOrdersClient from "./ManageOrdersClient";

// A tela administra pedidos de toda a plataforma (pagar, avançar, cancelar).
// Antes era um Client Component sem nenhuma verificação no servidor.
export default async function ManageOrdersPage() {
  await requirePage(Role.ADMIN);

  return <ManageOrdersClient />;
}

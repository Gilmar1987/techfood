import { redirect } from "next/navigation";
import { Role } from "@/domain/entities/user";
import { requirePage } from "@/lib/pageGuards";
import { supplierRepository } from "@/server/container";
import NewProductClient from "./NewProductClient";

// O fornecedor vem da sessão. Antes a página pedia que o usuário digitasse o
// próprio CNPJ — identidade vinda do formulário, que qualquer um podia forjar.
export default async function NewProductPage() {
  const user = await requirePage(Role.SUPPLIER);
  if (!user.cnpj) redirect("/login");

  const supplier = await supplierRepository.findByCNPJ(user.cnpj);
  if (!supplier) redirect("/login");

  return (
    <NewProductClient
      supplier={{ id: supplier.id, razaoSocial: supplier.razaoSocial, cnpj: supplier.cnpj }}
    />
  );
}

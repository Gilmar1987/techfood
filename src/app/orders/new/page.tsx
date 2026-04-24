import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { customerRepository } from "@/server/container";
import NewOrderClient from "./NewOrderClient";

export default async function NewOrderPage() {
  const session = await auth();
  if (!session?.user?.cpf) redirect("/login");

  const customer = await customerRepository.findByCPF(session.user.cpf);
  if (!customer) redirect("/login");

  return (
    <NewOrderClient
      customer={{
        id: customer.id,
        nome: customer.nome,
        email: customer.email,
        cpf: customer.cpf,
        endereco: customer.endereco,
        cep: customer.cep,
        telefone: customer.telefone,
      }}
    />
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supplierRepository, productRepository } from "@/server/container";
import ManageProductsClient from "./ManageProductsClient";

export default async function ManageProductsPage() {
  const session = await auth();
  if (!session?.user?.cnpj) redirect("/login");

  const supplier = await supplierRepository.findByCNPJ(session.user.cnpj);
  if (!supplier) redirect("/login");

  const products = await productRepository.findBySupplierId(supplier.id);

  const serialized = products.map((p) => ({
    id: p.id,
    nome: p.nome,
    preco: Number(p.preco),
    quantidade: p.quantidade,
    supplierId: p.supplierId,
  }));

  return (
    <ManageProductsClient
      supplier={{ id: supplier.id, razaoSocial: supplier.razaoSocial, cnpj: supplier.cnpj }}
      initialProducts={serialized}
    />
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { orderRepository, supplierRepository } from "@/server/container";
import { serializeOrders } from "@/server/serializers/order";
import FornecedorOrdersClient from "./FornecedorOrdersClient";

export default async function FornecedorOrdersPage() {
  const session = await auth();
  if (!session?.user?.cnpj) redirect("/login");

  const supplier = await supplierRepository.findByCNPJ(session.user.cnpj);
  if (!supplier) redirect("/login");

  const orders = await orderRepository.findAllBySupplierId(supplier.id);

  const serialized = serializeOrders(orders);

  return (
    <FornecedorOrdersClient
      initialOrders={serialized}
      cnpj={session.user.cnpj}
      supplierNome={supplier.razaoSocial}
    />
  );
}

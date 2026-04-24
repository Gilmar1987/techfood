import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { orderRepository, supplierRepository } from "@/server/container";
import FornecedorOrdersClient from "./FornecedorOrdersClient";

export default async function FornecedorOrdersPage() {
  const session = await auth();
  if (!session?.user?.cnpj) redirect("/login");

  const supplier = await supplierRepository.findByCNPJ(session.user.cnpj);
  if (!supplier) redirect("/login");

  const orders = await orderRepository.findAllBySupplierId(supplier.id);

  const serialized = orders.map((o) => ({
    id: o.id,
    status: o.statusOrder,
    paymentMethod: o.getPaymentMethod() ?? null,
    paidAt: o.getPaidAt()?.toISOString() ?? null,
    frete: Number(o.frete),
    total: Number(o.valorTotal) + Number(o.frete),
    createdAt: o.createdAt?.toISOString() ?? "",
    customerId: o.customerId,
    customer: o.customer ? { nome: (o.customer as any).nome } : null,
    items: o.getItems().map((i) => ({
      id: i.id,
      quantidade: i.quantidade,
      precoUnitario: Number(i.precoUnitario),
      product: { nome: i.product.nome },
    })),
  }));

  return (
    <FornecedorOrdersClient
      initialOrders={serialized}
      cnpj={session.user.cnpj}
      supplierNome={supplier.razaoSocial}
    />
  );
}

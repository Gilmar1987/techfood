import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { orderRepository, customerRepository } from "@/server/container";
import ClienteOrdersClient from "./ClienteOrdersClient";

export default async function ClienteOrdersPage() {
  const session = await auth();
  if (!session?.user?.cpf) redirect("/login");

  const customer = await customerRepository.findByCPF(session.user.cpf);
  if (!customer) redirect("/login");

  const orders = await orderRepository.findAllByCustomerId(customer.id);

  const serialized = orders.map((o) => ({
    id: o.id,
    status: o.statusOrder,
    paymentMethod: o.getPaymentMethod() ?? null,
    paidAt: o.getPaidAt()?.toISOString() ?? null,
    frete: Number(o.frete),
    total: Number(o.valorTotal) + Number(o.frete),
    createdAt: o.createdAt?.toISOString() ?? "",
    supplierId: o.supplierId,
    items: o.getItems().map((i) => ({
      id: i.id,
      quantidade: i.quantidade,
      precoUnitario: Number(i.precoUnitario),
      product: { nome: i.product.nome },
    })),
  }));

  return <ClienteOrdersClient initialOrders={serialized} customerId={customer.id} cpf={session.user.cpf} customerNome={customer.nome} />;
}

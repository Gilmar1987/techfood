import { createOrderUseCase, orderRepository, customerRepository, supplierRepository, payOrderUseCase, updateOrderStatusUseCase } from "@/server/container";
import { NextResponse } from "next/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_PAYMENT_METHODS = ["PIX", "CARD", "CASH"];

function serializeOrders(orders: any[]) {
  return orders.map((o: any) => ({
    id: o.id,
    status: o.statusOrder,
    paymentMethod: o.getPaymentMethod() ?? null,
    paidAt: o.getPaidAt() ?? null,
    frete: o.frete,
    total: o.valorTotal + o.frete,
    createdAt: o.createdAt,
    customer: o.customer ? { nome: (o.customer as any).nome } : null,
    customerId: o.customerId,
    supplierId: o.supplierId,
    items: o.getItems().map((i: any) => ({
      id: i.id,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      product: { nome: i.product.nome },
    })),
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf")?.replace(/[^\d]/g, "");
    const cnpj = searchParams.get("cnpj")?.replace(/[^\d]/g, "");

    if (cpf) {
      const customer = await customerRepository.findByCPF(cpf);
      if (!customer) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
      const orders = await orderRepository.findAllByCustomerId(customer.id);
      return NextResponse.json(serializeOrders(orders), { status: 200 });
    }

    if (cnpj) {
      const supplier = await supplierRepository.findByCNPJ(cnpj);
      if (!supplier) return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
      const orders = await orderRepository.findAllBySupplierId(supplier.id);
      return NextResponse.json(serializeOrders(orders), { status: 200 });
    }

    const orders = await orderRepository.findAll();
    return NextResponse.json(serializeOrders(orders), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
    const supplierId = typeof body.supplierId === "string" ? body.supplierId.trim() : "";
    const frete = typeof body.frete === "number" ? body.frete : 0;

    if (!customerId || !supplierId || !UUID_REGEX.test(customerId) || !UUID_REGEX.test(supplierId)) {
      return NextResponse.json({ error: "customerId and supplierId must be valid UUIDs" }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
    }

    const items = body.items.map((item: unknown) => {
      if (!item || typeof item !== "object") throw new Error("Invalid item");
      const i = item as Record<string, unknown>;
      const productId = typeof i.productId === "string" ? i.productId.trim() : "";
      const quantidade = Number(i.quantidade);
      if (!productId || !UUID_REGEX.test(productId) || isNaN(quantidade) || quantidade <= 0) throw new Error("Invalid item fields");
      return { productId, quantidade };
    });

    const order = await createOrderUseCase.execute({ customerId, supplierId, frete, items });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "id must be a valid UUID" }, { status: 400 });
    }

    const action = typeof body.action === "string" ? body.action : "";

    if (action === "pay") {
      const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.toUpperCase() : "";
      if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
        return NextResponse.json({ error: "paymentMethod must be PIX, CARD or CASH" }, { status: 400 });
      }
      await payOrderUseCase.execute(id, paymentMethod as "PIX" | "CARD" | "CASH");
      return NextResponse.json({ message: "Pedido pago com sucesso" }, { status: 200 });
    }

    if (action === "advance") {
      await updateOrderStatusUseCase.advance(id);
      return NextResponse.json({ message: "Status avancado com sucesso" }, { status: 200 });
    }

    if (action === "cancel") {
      await updateOrderStatusUseCase.cancel(id);
      return NextResponse.json({ message: "Pedido cancelado" }, { status: 200 });
    }

    return NextResponse.json({ error: "action must be pay, advance or cancel" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import {
  createOrderUseCase,
  orderRepository,
  customerRepository,
  supplierRepository,
  payOrderUseCase,
  updateOrderStatusUseCase,
} from "@/server/container";
import { NextResponse } from "next/server";
import { Order } from "@/domain/entities/Order";
import { Actor, Role } from "@/domain/entities/user";
import { PaymentMethod } from "@/domain/enums/OrderStatus";
import { serializeOrders } from "@/server/serializers/order";
import {
  requireSession,
  errorResponse,
  isAdmin,
  HttpError,
  SessionUser,
} from "@/lib/requireSession";
import { isUuid } from "@/lib/validation";

const VALID_PAYMENT_METHODS: PaymentMethod[] = ["PIX", "CARD", "CASH"];

function toActor(user: SessionUser): Actor {
  return { role: user.role, customerId: user.customerId, supplierId: user.supplierId };
}

/**
 * O escopo da listagem vem da sessão: cliente vê os próprios pedidos,
 * fornecedor vê os que recebeu, admin vê tudo (com filtro opcional).
 */
async function ordersForSession(user: SessionUser, request: Request): Promise<Order[]> {
  if (isAdmin(user)) {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf")?.replace(/[^\d]/g, "");
    const cnpj = searchParams.get("cnpj")?.replace(/[^\d]/g, "");

    if (cpf) {
      const customer = await customerRepository.findByCPF(cpf);
      if (!customer) throw new HttpError(404, "Cliente não encontrado");
      return orderRepository.findAllByCustomerId(customer.id);
    }
    if (cnpj) {
      const supplier = await supplierRepository.findByCNPJ(cnpj);
      if (!supplier) throw new HttpError(404, "Fornecedor não encontrado");
      return orderRepository.findAllBySupplierId(supplier.id);
    }
    return orderRepository.findAll();
  }

  if (user.role === Role.CUSTOMER) {
    if (!user.customerId) throw new HttpError(403, "Usuário não está vinculado a um cliente");
    return orderRepository.findAllByCustomerId(user.customerId);
  }

  if (user.role === Role.SUPPLIER) {
    if (!user.supplierId) throw new HttpError(403, "Usuário não está vinculado a um fornecedor");
    return orderRepository.findAllBySupplierId(user.supplierId);
  }

  throw new HttpError(403, "Acesso negado");
}

export async function GET(request: Request) {
  try {
    const user = await requireSession();
    const orders = await ordersForSession(user, request);
    return NextResponse.json(serializeOrders(orders), { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(Role.CUSTOMER, Role.ADMIN);

    const body = await request.json();
    if (!body || typeof body !== "object") {
      throw new HttpError(400, "Corpo da requisição inválido");
    }

    // Quem compra vem da sessão. O fornecedor, não: o cliente escolhe
    // livremente de qual fornecedor da plataforma quer comprar.
    const customerId = isAdmin(user)
      ? (typeof body.customerId === "string" ? body.customerId.trim() : "")
      : (user.customerId ?? "");
    const supplierId = typeof body.supplierId === "string" ? body.supplierId.trim() : "";

    if (!isUuid(customerId)) {
      throw new HttpError(400, "customerId deve ser um UUID válido");
    }
    if (!isUuid(supplierId)) {
      throw new HttpError(400, "supplierId deve ser um UUID válido");
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new HttpError(400, "items deve ser uma lista não vazia");
    }

    const items = body.items.map((item: unknown) => {
      if (!item || typeof item !== "object") throw new HttpError(400, "Item inválido");
      const i = item as Record<string, unknown>;
      const productId = typeof i.productId === "string" ? i.productId.trim() : "";
      const quantidade = Number(i.quantidade);
      if (!isUuid(productId) || isNaN(quantidade) || quantidade <= 0) {
        throw new HttpError(400, "Campos do item inválidos");
      }
      return { productId, quantidade };
    });

    // `frete` do corpo é ignorado de propósito: é calculado no servidor.
    const order = await createOrderUseCase.execute({ customerId, supplierId, items });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSession();
    const actor = toActor(user);

    const body = await request.json();
    if (!body || typeof body !== "object") {
      throw new HttpError(400, "Corpo da requisição inválido");
    }

    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!isUuid(id)) {
      throw new HttpError(400, "id deve ser um UUID válido");
    }

    const action = typeof body.action === "string" ? body.action : "";

    // A posse do pedido é verificada dentro de cada use case, que conhece
    // a regra: quem paga é o cliente, quem avança o preparo é o fornecedor.
    if (action === "pay") {
      const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.toUpperCase() : "";
      if (!VALID_PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
        throw new HttpError(400, "paymentMethod deve ser PIX, CARD ou CASH");
      }
      await payOrderUseCase.execute(id, paymentMethod as PaymentMethod, actor);
      return NextResponse.json({ message: "Pedido pago com sucesso" }, { status: 200 });
    }

    if (action === "advance") {
      await updateOrderStatusUseCase.advance(id, actor);
      return NextResponse.json({ message: "Status avancado com sucesso" }, { status: 200 });
    }

    if (action === "cancel") {
      await updateOrderStatusUseCase.cancel(id, actor);
      return NextResponse.json({ message: "Pedido cancelado" }, { status: 200 });
    }

    throw new HttpError(400, "action deve ser pay, advance ou cancel");
  } catch (error) {
    return errorResponse(error);
  }
}

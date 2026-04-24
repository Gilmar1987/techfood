import { orderRepository, customerRepository, supplierRepository } from "@/server/container";
import { auth } from "@/lib/auth";

const HEARTBEAT_INTERVAL = 25_000;
const POLL_INTERVAL = 5_000;

function serialize(orders: any[]) {
    return orders.map((o: any) => ({
        id: o.id,
        status: o.statusOrder,
        paymentMethod: o.getPaymentMethod() ?? null,
        paidAt: o.getPaidAt()?.toISOString() ?? null,
        frete: Number(o.frete),
        total: Number(o.valorTotal) + Number(o.frete),
        createdAt: o.createdAt?.toISOString() ?? "",
        customerId: o.customerId,
        supplierId: o.supplierId,
        customer: o.customer ? { nome: (o.customer as any).nome } : null,
        items: o.getItems().map((i: any) => ({
            id: i.id,
            quantidade: i.quantidade,
            precoUnitario: Number(i.precoUnitario),
            product: { nome: i.product.nome },
        })),
    }));
}

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf");
    const cnpj = searchParams.get("cnpj");

    const encoder = new TextEncoder();
    let pollTimer: ReturnType<typeof setInterval>;
    let heartbeatTimer: ReturnType<typeof setInterval>;

    const stream = new ReadableStream({
        async start(controller) {
            async function fetchAndSend() {
                try {
                    let orders: any[] = [];

                    if (cpf) {
                        const customer = await customerRepository.findByCPF(cpf);
                        if (customer) orders = await orderRepository.findAllByCustomerId(customer.id);
                    } else if (cnpj) {
                        const supplier = await supplierRepository.findByCNPJ(cnpj);
                        if (supplier) orders = await orderRepository.findAllBySupplierId(supplier.id);
                    }

                    const data = `data: ${JSON.stringify(serialize(orders))}\n\n`;
                    controller.enqueue(encoder.encode(data));
                } catch {
                    // conexão pode ter sido fechada
                }
            }

            // Envio imediato ao conectar
            await fetchAndSend();

            // Poll leve a cada 5s (só processa se há conexão ativa)
            pollTimer = setInterval(fetchAndSend, POLL_INTERVAL);

            // Heartbeat para manter a conexão viva
            heartbeatTimer = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": heartbeat\n\n"));
                } catch { /* conexão fechada */ }
            }, HEARTBEAT_INTERVAL);
        },
        cancel() {
            clearInterval(pollTimer);
            clearInterval(heartbeatTimer);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}

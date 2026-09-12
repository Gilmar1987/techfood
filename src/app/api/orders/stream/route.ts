import { orderRepository } from "@/server/container";
import { Order } from "@/domain/entities/Order";
import { Role } from "@/domain/entities/user";
import { serializeOrders } from "@/server/serializers/order";
import { requireSession, errorResponse, isAdmin } from "@/lib/requireSession";

const HEARTBEAT_INTERVAL = 25_000;
const POLL_INTERVAL = 5_000;

export async function GET() {
    let user;
    try {
        user = await requireSession();
    } catch (error) {
        return errorResponse(error);
    }

    // O escopo vem da sessão. Os antigos parâmetros `?cpf=`/`?cnpj=` eram
    // aceitos sem conferência e deixavam qualquer usuário logado acompanhar
    // os pedidos de outro — por isso não são mais lidos.
    const scope = isAdmin(user)
        ? { kind: "all" as const }
        : user.role === Role.SUPPLIER && user.supplierId
            ? { kind: "supplier" as const, id: user.supplierId }
            : user.role === Role.CUSTOMER && user.customerId
                ? { kind: "customer" as const, id: user.customerId }
                : { kind: "none" as const };

    async function loadOrders(): Promise<Order[]> {
        switch (scope.kind) {
            case "all": return orderRepository.findAll();
            case "supplier": return orderRepository.findAllBySupplierId(scope.id);
            case "customer": return orderRepository.findAllByCustomerId(scope.id);
            default: return [];
        }
    }

    const encoder = new TextEncoder();
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let heartbeatTimer: ReturnType<typeof setInterval> | undefined;

    const stream = new ReadableStream({
        async start(controller) {
            let closed = false;

            const stop = () => {
                closed = true;
                if (pollTimer) clearInterval(pollTimer);
                if (heartbeatTimer) clearInterval(heartbeatTimer);
            };

            async function fetchAndSend() {
                if (closed) return;
                try {
                    const orders = await loadOrders();
                    const data = `data: ${JSON.stringify(serializeOrders(orders))}\n\n`;
                    controller.enqueue(encoder.encode(data));
                } catch {
                    // Conexão fechada ou consulta falhou: encerra os timers para
                    // não continuar consultando o banco por um cliente ausente.
                    stop();
                }
            }

            await fetchAndSend();

            pollTimer = setInterval(fetchAndSend, POLL_INTERVAL);

            heartbeatTimer = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": heartbeat\n\n"));
                } catch {
                    stop();
                }
            }, HEARTBEAT_INTERVAL);
        },
        cancel() {
            if (pollTimer) clearInterval(pollTimer);
            if (heartbeatTimer) clearInterval(heartbeatTimer);
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

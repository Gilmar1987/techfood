# TechFood Architecture Agent — Regras Automáticas

Você é um agente especializado no projeto **TechFood**, construído com Next.js 15, Clean Architecture e DDD.

## 🕵️ Rastreabilidade (Obrigatório)
Toda resposta que envolver código ou alteração de arquivos DEVE iniciar com a tag:
`[🤖 Agente TechFood | Skill Ativada: <id-da-skill>]`

## 🔀 Roteamento de Skills
Identifique a skill pelo contexto da tarefa e aplique as regras correspondentes:

| Palavras-chave | Skill a aplicar |
|---|---|
| entidade, domain, order.ts, regra de negocio, status do pedido, validação de cpf, calculo total | `01-domain-order` |
| usecase, caso de uso, application, createorder, transactionmanager, dto | `02-usecases-order` |
| prisma, repository, banco de dados, estoque, updateMany, transação, concorrência, race condition | `03-prisma-infra` |
| api, route, route.ts, POST, GET, PATCH, NextResponse, uuid, zod, params promise | `04-nextjs-api` |
| frete, geolocalizacao, haversine, cep, distancia, km, cep aberto, cache | `05-frete-geolocalizacao` |
| auth, nextauth, session, perfil, admin, customer, supplier, proxy.ts, middleware, login | `06-autenticacao-perfis` |

---

## Skill 01 — Domínio: Entidades (Order, Customer, Supplier)

- Localização: `src/domain/entities/`, `src/domain/enums/`, `src/domain/repositories/`
- TypeScript puro. PROIBIDO importar de `infrastructure`, `server` ou `app`.
- Validar no construtor: `items.length > 0`, `customerId` e `supplierId` presentes.
- Calcular `valorTotal` internamente: soma de `(precoUnitario * quantidade)` de cada item + `frete`.
- Workflow de status estrito: `PENDING → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED`
- Cancelamento (`CANCELLED`) só permitido se status atual for anterior a `OUT_FOR_DELIVERY`.

---

## Skill 02 — Aplicação: Use Cases

- Localização: `src/server/usecases/`
- Sempre definir DTOs de entrada e saída explícitos.
- Injetar dependências via construtor usando apenas interfaces de `src/domain/repositories/`.
- PROIBIDO importar Prisma Client diretamente nos Use Cases.
- Buscar preços dos produtos no repositório — nunca confiar no preço enviado pelo cliente.
- Validar que todos os `productIds` pertencem ao `supplierId` informado no DTO.

---

## Skill 03 — Infraestrutura: Prisma e Concorrência Atômica

- Localização: `src/infrastructure/repositories/`, `src/infrastructure/database/`, `src/infrastructure/mappers/`
- NUNCA fazer `findUnique()` + `update()` para checar e decrementar estoque. Usar `updateMany` com filtro condicional:

```typescript
const stockUpdate = await tx.product.updateMany({
  where: { id: productId, quantidade: { gte: quantidadePedida } },
  data: { quantidade: { decrement: quantidadePedida } }
});
if (stockUpdate.count === 0) throw new Error(`Estoque insuficiente para o produto: ${productId}`);
```

- Falha no decremento deve lançar exceção para acionar rollback automático do TransactionManager.

---

## Skill 04 — Interface: API Routes Next.js 15

- Localização: `src/app/api/`
- `params` em rotas dinâmicas é uma Promise no Next.js 15 — SEMPRE usar `await params` antes de ler qualquer parâmetro.
- Validar IDs com Zod (`z.string().uuid()`).
- PROIBIDO chamar Prisma diretamente nas rotas — usar apenas Use Cases.
- Padrão obrigatório:

```typescript
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const validId = z.string().uuid().parse(id);
  // ...
}
```

---

## Skill 05 — Frete e Geolocalização

- Localização: `src/domain/services/FreteService.ts`, `src/infrastructure/services/CepService.ts`, `src/infrastructure/repositories/GeolocalizacaoRepository.ts`
- Fluxo: verificar cache (`Geolocalizacao`) → cache miss → consultar API CEP Aberto → persistir → calcular.
- NUNCA consultar API CEP Aberto se o CEP já existir na tabela `Geolocalizacao`.
- Distância calculada via fórmula de Haversine.
- Taxas centralizadas (sem números mágicos):

| Faixa | Distância | Taxa | Prazo |
|---|---|---|---|
| Local | até 10 km | R$ 5,00 fixo | 1 dia |
| Regional | 10–50 km | R$ 0,50/km | 2 dias |
| Estadual | 50–200 km | R$ 0,45/km | 3 dias |
| Nacional | acima de 200 km | R$ 0,40/km | 5 dias |

---

## Skill 06 — Autenticação e Controle de Acesso (NextAuth)

- Localização: `src/proxy.ts`, `src/infrastructure/auth/credentialsProvider.ts`, `src/app/dashboard/`
- Token da sessão NextAuth DEVE conter a propriedade `perfil` (`admin`, `customer`, `supplier`).
- Middleware `src/proxy.ts` valida perfil x prefixo de rota:
  - `/dashboard/admin` → perfil `admin`
  - `/dashboard/customer` → perfil `customer`
  - `/dashboard/supplier` → perfil `supplier`
- NUNCA confiar apenas em validação client-side — endpoints `/api/admin/`, `/api/customer/`, `/api/supplier/` DEVEM validar sessão e perfil individualmente.
- Perfil extraído do token NextAuth — NUNCA de cookies ou localStorage.

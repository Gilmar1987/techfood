# Skill: Desenvolvimento da Camada de Domínio - Entidade Order
## 🕵️ Rastreabilidade (Obrigatório)
- Toda resposta gerada usando esta skill DEVE iniciar com a seguinte tag de identificação na primeira linha: 
  `[🤖 Agente TechFood | Skill Ativada: <Nome_Da_Skill_Aqui>]`
- O `<Nome_Da_Skill_Aqui>` DEVE ser exatamente igual ao título desta skill, sem acentos e com palavras separadas por hífen (ex: `01-domain-order`).

## 🎯 Objetivo
Orientar o agente na criação e manutenção da lógica pura de negócios, invariantes e validações das entidades de pedidos (`Order` e `OrderItem`) sem acoplamento com frameworks ou infraestrutura.

## 🚀 Estratégia de Inicialização (Do Zero)
- Se o diretório `src/domain/` não existir, crie a árvore: `entities/`, `enums/`, e `repositories/`.
- Escreva código TypeScript puro. Não adicione decorators (ex: TypeORM/Prisma) ou bibliotecas de validação externa (ex: Zod) nesta camada.

## 📌 Localização no Projeto
- Entidades: `src/domain/entities/Order.ts` e `src/domain/entities/OrderItem.ts`
- Enums: `src/domain/enums/OrderStatus.ts`
- Interfaces de Repositório: `src/domain/repositories/IOrderRepository.ts`

## 📝 Procedimento Passos (Workflow)
1. **Definição de Tipagem (Props):** Crie uma interface `OrderProps` contendo: `id`, `customerId`, `supplierId`, `items`, `frete`, `valorTotal`, `status`, `createdAt`.
2. **Invariantes e Validações no Construtor:**
   - Validar se a lista de itens (`items`) possui comprimento maior que zero.
   - Validar se `customerId` e `supplierId` estão presentes.
   - Forçar o cálculo automático do `valorTotal` somando o preço unitário x quantidade de cada item mais o valor do frete.
3. **Gerenciamento de Estado (Workflow de Status):** Implemente métodos de alteração de status baseados nas regras de transição válidas.

## 🛑 Restrições e Guardrails
- **Isolamento Total:** É terminantemente PROIBIDO importar arquivos de `infrastructure`, `server` ou `app` dentro desta camada.
- **Workflow de Status Estrito:** O fluxo de estados deve aceitar apenas: `PENDING → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED`.
- **Regra de Cancelamento:** Um pedido só pode mudar para `CANCELLED` se o status atual for anterior a `OUT_FOR_DELIVERY`.

## 📐 Padrão de Implementação Esperado (Output Template)
```typescript
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItemProps {
  productId: string;
  quantidade: number;
  precoUnitario: number;
}

export interface OrderProps {
  id?: string;
  customerId: string;
  supplierId: string;
  items: OrderItemProps[];
  frete: number;
  status?: OrderStatus;
}

// Implementar classe Order validando items.length > 0 e calculando totais internamente.
```

# Skill: Desenvolvimento da Camada de Aplicação - Casos de Uso (Use Cases)

## 🕵️ Rastreabilidade (Obrigatório)
- Toda resposta gerada usando esta skill DEVE iniciar com a seguinte tag de identificação na primeira linha: 
  `[🤖 Agente TechFood | Skill Ativada: <Nome_Da_Skill_Aqui>]`
- O `<Nome_Da_Skill_Aqui>` DEVE ser exatamente igual ao título desta skill, sem acentos e com palavras separadas por hífen (ex: `02-usecases-order`).

## 🎯 Objetivo
Instruir o agente na criação do caso de uso `CreateOrderUseCase` que dita a orquestração do fluxo do pedido, injetando interfaces e disparando as entidades de domínio.

## 🚀 Estratégia de Inicialização (Do Zero)
- Crie a pasta `src/server/usecases/` se ela não existir.
- Sempre crie ou verifique a existência de DTOs de entrada (Input) e saída (Output) claros para o caso de uso.

## 📌 Localização no Projeto
- Caso de Uso: `src/server/usecases/CreateOrderUseCase.ts`

## 📝 Procedimento Passos (Workflow)
1. **Recebimento do DTO:** Aceitar um payload contendo `customerId`, `supplierId`, o array de itens (com `productId` e `quantidade`) e o valor do `frete`.
2. **Injeção de Dependências:** Receber via construtor as interfaces `IOrderRepository`, `IProductRepository` e uma abstração de transação `ITransactionManager`.
3. **Orquestração de Regras:**
   - Buscar os produtos no repositório para capturar os preços vigentes (nunca confie no preço enviado pelo cliente).
   - Instanciar a entidade de domínio `Order` passando os dados consolidados.
4. **Execução de Transação:** Invocar o `TransactionManager` para amarrar o fluxo de banco.

## 🛑 Restrições e Guardrails
- **Inversão de Dependência:** O caso de uso deve depender APENAS das interfaces localizadas em `src/domain/repositories/`. É proibido importar a instância do Prisma Client aqui.
- **Validação de Fornecedor Unificado:** Validar se todos os `productIds` consultados pertencem de fato ao `supplierId` informado no DTO.

## 📐 Padrão de Implementação Esperado (Output Template)
```typescript
import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

export interface CreateOrderInputDTO {
  customerId: string;
  supplierId: string;
  items: { productId: string; quantidade: number }[];
  frete: number;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private transactionManager: ITransactionManager
  ) {}

  async execute(input: CreateOrderInputDTO): Promise<{ id: string }> {
    // Buscar preços -> Instanciar Domínio -> Chamar Transação
  }
}
```

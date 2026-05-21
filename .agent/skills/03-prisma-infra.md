# Skill: Camada de Infraestrutura - Persistência e Concorrência Atômica

## 🕵️ Rastreabilidade (Obrigatório)
- Toda resposta gerada usando esta skill DEVE iniciar com a seguinte tag de identificação na primeira linha: 
  `[🤖 Agente TechFood | Skill Ativada: <Nome_Da_Skill_Aqui>]`
- O `<Nome_Da_Skill_Aqui>` DEVE ser exatamente igual ao título desta skill, sem acentos e com palavras separadas por hífen (ex: `03-prisma-infra`).

## 🎯 Objetivo
Guiar o agente na implementação real do banco de dados usando Prisma ORM, mapeando os dados do domínio para o banco PostgreSQL e mitigando problemas de concorrência concorrente.

## 🚀 Estratégia de Inicialização (Do Zero)
- Crie as pastas `src/infrastructure/database/` e `src/infrastructure/repositories/`.
- Crie também os mappers (`src/infrastructure/mappers/`) para isolar o formato do Prisma do formato da entidade do Domínio.

## 📌 Localização no Projeto
- Repositório: `src/infrastructure/repositories/PrismaOrderRepository.ts`
- Gerenciador de Transações: `src/infrastructure/database/PrismaTransactionManager.ts`

## 📝 Procedimento Passos (Workflow)
1. **Implementação da Interface:** Faça a classe herdar e implementar os métodos definidos em `IOrderRepository`.
2. **Lógica de Concorrência Atômica (Estoque):** Para cada item do pedido, use o comando nativo do Prisma que executa diretamente no banco com uma trava lógica, evitando condições de corrida (*race conditions*).
3. **Mapeamento:** Antes de persistir, transforme o objeto de Domínio no formato aceito pelo modelo gerado pelo Prisma.

## 🛑 Restrições e Guardrails
- **Garantia de Estoque Atômico:** NUNCA faça um `findUnique()` para checar a quantidade seguido de um `update()`. Essa abordagem quebra em cenários de compras simultâneas. Use a cláusula `updateMany` com filtro condicional.
- **Cancelamento por Falha:** Se qualquer produto falhar no decremento de estoque por falta de saldo, dispare uma exceção para que o `TransactionManager` aplique Rollback automático na operação inteira.

## 📐 Padrão de Implementação Esperado (Output Template)
```typescript
// Padrão obrigatório para decrementar estoque de forma atômica no TechFood
const stockUpdate = await tx.product.updateMany({
  where: {
    id: productId,
    quantidade: { gte: quantidadePedida } // Filtro atômico de segurança
  },
  data: {
    quantidade: { decrement: quantidadePedida }
  }
});

if (stockUpdate.count === 0) {
  throw new Error(`Estoque insuficiente para o produto: ${productId}`);
}
```

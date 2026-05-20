# Skill: Camada de Interface - API Routes no Next.js 15 (App Router)

## 🎯 Objetivo
Orientar o agente no desenvolvimento de rotas de API robustas no Next.js 15, garantindo validação de payloads com Zod, tratamento correto do ciclo de vida assíncrono e formatação de respostas HTTP.

## 🚀 Estratégia de Inicialização (Do Zero)
- Crie os diretórios de rotas exatamente como estruturado no padrão App Router: `src/app/api/orders/route.ts` e `src/app/api/orders/[id]/route.ts`.

## 📌 Localização no Projeto
- Endpoints: `src/app/api/orders/route.ts` e `src/app/api/orders/[id]/route.ts`

## 📝 Procedimento Passos (Workflow)
1. **Assinatura do Next.js 15:** Declarar os verbos HTTP usando funções tipadas exportadas (ex: `POST`, `GET`, `PATCH`).
2. **Leitura e Tratamento do Dynamic Params:** No Next.js 15, o objeto `params` passado para a rota dinâmica é obrigatoriamente uma Promise. Você DEVE aplicar o `await` nele antes de ler qualquer parâmetro (como o `id`).
3. **Validação e Sanitização:** Criar um schema do Zod exigindo que todas as chaves de identificação (como `customerId` e `supplierId`) obedeçam estritamente à máscara de UUID v4.
4. **Instanciação e Resposta:** Acionar o caso de uso e envelopar retornos com o utilitário `NextResponse.json()`.

## 🛑 Restrições e Guardrails
- **Isolamento de Infraestrutura:** É proibido chamar métodos diretos do Prisma dentro deste arquivo. Esta camada serve apenas para receber a requisição HTTP, sanitizar dados e acionar os casos de uso.
- **Abstração Obrigatória de Params:** NUNCA escreva código tentando acessar `params.id` sem antes resolver a Promise com `await params` (padrão de quebra de retrocompatibilidade do Next.js 15).

## 📐 Padrão de Implementação Esperado (Output Template)
```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

const idParamSchema = z.string().uuid();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Params como Promise no Next.js 15
) {
  try {
    const { id } = await params; // Resolução obrigatória
    const validId = idParamSchema.parse(id);
    
    // Processamento...
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
```

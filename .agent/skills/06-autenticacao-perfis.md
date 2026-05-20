# Skill: Autenticação e Controle de Acesso por Perfil (NextAuth)

## 🎯 Objetivo
Instruir o agente na proteção de rotas e verificação de escopo de usuários (RBAC), baseando-se na integração do NextAuth com a entidade `User` do banco.

## 📌 Localização no Projeto
- Middleware de Rotas: `src/proxy.ts`
- Provedor de Credenciais: `src/infrastructure/auth/credentialsProvider.ts`
- Páginas de Dashboard: `src/app/dashboard/`

## 📝 Procedimento Passos (Workflow)
1. **Validação de Sessão:** Garantir que o token da sessão do NextAuth contenha a propriedade `perfil` (`admin`, `customer` ou `supplier`).
2. **Bloqueio via Middleware:** Modificar ou analisar o arquivo `src/proxy.ts` para validar se o perfil do usuário logado confere com o prefixo da rota solicitada.
3. **Roteamento de Dashboards:**
   - Rotas `/dashboard/admin` exigem perfil `admin`.
   - Rotas `/dashboard/customer` exigem perfil `customer`.
   - Rotas `/dashboard/supplier` exigem perfil `supplier`.

## 🛑 Restrições e Guardrails
- NUNCA confie apenas na validação visual do lado do cliente (Client Components); os endpoints correspondentes em `/api/admin/`, `/api/customer/` e `/api/supplier/` DEVEM validar a sessão e o perfil do token individualmente.
- O perfil do usuário deve ser extraído diretamente do token de sessão do NextAuth, e não de cookies ou localStorage.
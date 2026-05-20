# 🍕 TechFood — Order Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)]
[![React](https://img.shields.io/badge/React-19-blue?logo=react)]
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)]
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)]
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)]
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture%20%2B%20DDD-green)]
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)]

---

## 🚀 Visão Geral

**TechFood** é um sistema fullstack de gestão de pedidos para restaurantes e food services, construído com **Next.js**, seguindo os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**.

Conta com autenticação via **NextAuth**, dashboards por perfil (admin, cliente, fornecedor), cálculo de frete por geolocalização e fluxo completo de pedidos com controle de estoque atômico.

---

## 🧠 Arquitetura

```text
src/
 ├── app/                        # UI + API Routes (Next.js App Router)
 │   ├── api/                    # Endpoints REST
 │   │   ├── admin/              # Rotas administrativas
 │   │   ├── auth/               # NextAuth (login/sessão)
 │   │   ├── customer/           # GET, POST, PATCH
 │   │   ├── frete/              # GET (cálculo de frete)
 │   │   ├── geo/                # GET (geolocalização)
 │   │   ├── orders/             # GET, POST
 │   │   ├── products/           # GET, POST, PUT, DELETE
 │   │   └── supplier/           # GET, POST
 │   ├── customer/               # Páginas de clientes
 │   ├── dashboard/              # Dashboards por perfil (admin, cliente, fornecedor)
 │   ├── login/                  # Página de autenticação
 │   ├── orders/                 # Páginas de pedidos (cliente e fornecedor)
 │   ├── products/               # Páginas de produtos
 │   └── supplier/               # Páginas de fornecedores
 ├── domain/                     # Entidades + Regras de Negócio
 │   ├── entities/               # Product, Customer, Order, OrderItem, Supplier, User
 │   ├── enums/                  # OrderStatus
 │   ├── repositories/           # Interfaces dos repositórios
 │   └── services/               # FreteService (Haversine), IAuthService
 ├── infrastructure/             # Prisma + Repositórios + Mappers + Serviços
 │   ├── auth/                   # credentialsProvider (NextAuth)
 │   ├── database/               # TransactionManager
 │   ├── mappers/                # Mapeamento domínio ↔ Prisma
 │   ├── repositories/           # Implementações Prisma + GeolocalizacaoRepository + UserRepository
 │   └── services/               # CepService (API CEP Aberto)
 └── server/                     # Use Cases + Container DI
     └── usecases/               # CreateOrder, CreateProduct, CreateCustomer,
                                 # CreateSupplier, AuthenticateUser,
                                 # PayOrder, UpdateOrderStatus
```

---

## 🧱 Camadas

### 🔹 Domínio
- Entidades: `Product`, `Customer`, `Order`, `OrderItem`, `Supplier`, `User`
- Validações no construtor (CPF, email, CEP, telefone, CNPJ, coordenadas)
- Sem dependências externas

### 🔹 Aplicação (Use Cases)
- `CreateOrderUseCase` — transação atômica via `TransactionManager`
- `CreateProductUseCase` — vinculado a um `Supplier`
- `CreateCustomerUseCase` — com validações de unicidade
- `CreateSupplierUseCase` — com validação de CNPJ
- `AuthenticateUserUseCase` — autenticação via credenciais
- `PayOrderUseCase` — processamento de pagamento do pedido
- `UpdateOrderStatusUseCase` — atualização do status do pedido

### 🔹 Infraestrutura
- Prisma ORM com adapter `@prisma/adapter-pg`
- Repositórios: `PrismaProductRepository`, `PrismaCustomerRepository`, `PrismaOrderRepository`, `PrismaOrderItemRepository`, `PrismaSupplierRepository`, `PrismaUserRepository`, `GeolocalizacaoRepository`
- `CepService` — integração com API CEP Aberto (autenticada por token)
- `FreteService` — cálculo de distância via fórmula de Haversine
- `credentialsProvider` — integração com NextAuth

### 🔹 Interface (Next.js)
- API Routes com sanitização de inputs e validação UUID
- Server Components para listagens
- Client Components para formulários e interações
- Dashboards por perfil: admin, cliente e fornecedor

---

## 🔐 Autenticação

- NextAuth com `CredentialsProvider`
- Entidade `User` no domínio com repositório próprio (`PrismaUserRepository`)
- Sessão com perfis diferenciados: `admin`, `customer`, `supplier`
- Rotas protegidas por middleware (`src/proxy.ts`)
- Dashboards específicos por perfil em `/dashboard/admin`, `/dashboard/customer`, `/dashboard/supplier`

---

## 🔄 Fluxo de Criação de Pedido

```text
1. Cliente informa CPF
       ↓
2. Sistema busca cliente
   ✔ Existe → carrega dados (nome, email, endereço, CEP)
   ✘ Não existe → formulário de cadastro
       ↓
3. Cliente confirma ou altera endereço/CEP
       ↓
4. Sistema calcula frete
   → Busca coordenadas no cache (tabela Geolocalizacao)
   → Cache miss → consulta API CEP Aberto → salva no cache
   → Haversine: distância entre CEP do cliente e coordenadas do fornecedor
   → Frete por faixa: Local / Regional / Estadual / Nacional
       ↓
5. Cliente escolhe fornecedor
       ↓
6. Sistema exibe produtos do fornecedor com controle de estoque
       ↓
7. Cliente monta carrinho (validação de estoque em tempo real)
       ↓
8. Finaliza pedido (transação atômica: decrementa estoque + cria pedido)
       ↓
9. Pagamento processado via PayOrderUseCase
```

---

## 🧾 Regras de Negócio

### 📦 Product
- Vinculado obrigatoriamente a um `Supplier` via `supplierId`
- Nome único por fornecedor
- Controle de estoque (`quantidade`)
- Soft delete (`deletedAt`)
- Impede estoque negativo via `updateMany` atômico

### 👤 Customer
- CPF único (validação com dígitos verificadores)
- Email único
- Validação de CEP, telefone e nome no construtor
- Endereço e CEP atualizáveis via `PATCH`

### 🏭 Supplier
- CNPJ único com validação dos dígitos verificadores
- Email único
- Coordenadas geográficas (latitude/longitude) para cálculo de frete
- Relacionamento 1-N com `Product` e `Order`

### 🧾 Order
- Deve conter pelo menos um item
- `supplierId` obrigatório — pedido exclusivo de um fornecedor
- Total calculado internamente (`valorTotal`)
- Frete armazenado no pedido (`frete`)
- Workflow de status: `PENDING → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED / CANCELLED`
- Transação atômica: decremento de estoque + criação do pedido
- Pagamento gerenciado pelo `PayOrderUseCase`

### 🧾 OrderItem
- `quantidade > 0`
- `precoUnitario > 0`
- Subtotal calculado internamente

---

## 🚚 Cálculo de Frete

| Faixa | Distância | Taxa | Prazo |
|---|---|---|---|
| Local | até 10 km | R$ 5,00 fixo | 1 dia |
| Regional | 10–50 km | R$ 0,50/km | 2 dias |
| Estadual | 50–200 km | R$ 0,45/km | 3 dias |
| Nacional | acima de 200 km | R$ 0,40/km | 5 dias |

**Cache de geolocalização:** coordenadas consultadas uma vez e armazenadas na tabela `Geolocalizacao` (CEP como PK). Consultas subsequentes do mesmo CEP não chamam a API externa.

---

## 🔒 Controle de Concorrência (Estoque)

```ts
prisma.product.updateMany({
  where: { id: productId, quantidade: { gte: quantidade } }
})
```

- Previne race conditions
- Garante consistência dos dados
- Evita estoque negativo

---

## 🗄️ Modelos do Banco de Dados

| Model | Campos principais |
|---|---|
| `Product` | id, nome, preco, quantidade, supplierId |
| `Customer` | id, nome, email, cpf, cep, endereco, telefone |
| `Order` | id, total, frete, status, customerId, supplierId |
| `OrderItem` | id, quantidade, precoUnitario, orderId, productId |
| `Supplier` | id, razaoSocial, cnpj, email, cep, latitude, longitude |
| `Geolocalizacao` | cep (PK), latitude, longitude |
| `User` | id, email, senha, perfil |

---

## 📡 API Routes

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/[...nextauth]` | Login / sessão (NextAuth) |
| `GET` | `/api/customer?cpf=` | Busca cliente por CPF |
| `POST` | `/api/customer` | Cadastra cliente |
| `PATCH` | `/api/customer` | Atualiza endereço/CEP |
| `GET` | `/api/products?supplierId=` | Lista produtos (com filtro por fornecedor) |
| `POST` | `/api/products` | Cria produto |
| `PUT` | `/api/products` | Atualiza produto |
| `DELETE` | `/api/products?id=` | Remove produto (soft delete) |
| `GET` | `/api/supplier?cnpj=` | Busca fornecedor por CNPJ |
| `GET` | `/api/supplier` | Lista fornecedores |
| `POST` | `/api/supplier` | Cadastra fornecedor |
| `GET` | `/api/orders` | Lista pedidos |
| `POST` | `/api/orders` | Cria pedido |
| `GET` | `/api/frete?cep=&supplierId=` | Calcula frete com cache de geolocalização |
| `GET` | `/api/geo` | Consulta geolocalização por CEP |
| `GET/POST` | `/api/admin` | Rotas administrativas |

---

## 🖥️ Páginas UI

| Rota | Descrição |
|---|---|
| `/` | Landing page do TechFood |
| `/login` | Página de autenticação |
| `/dashboard/admin` | Dashboard administrativo |
| `/dashboard/customer` | Dashboard do cliente |
| `/dashboard/supplier` | Dashboard do fornecedor |
| `/products` | Listagem de produtos com paginação e toggle |
| `/products/new` | Cadastro de produto (identificação por CNPJ do fornecedor) |
| `/products/manage` | CRUD completo de produtos por fornecedor |
| `/customer` | Listagem de clientes |
| `/customer/new` | Cadastro de cliente |
| `/orders` | Listagem de pedidos com subtotal, frete e total |
| `/orders/new` | Criação de pedido (5 steps: cliente → endereço → fornecedor → produtos → finalizar) |
| `/orders/cliente` | Pedidos do cliente autenticado |
| `/orders/fornecedor` | Pedidos recebidos pelo fornecedor |
| `/orders/manage` | Gerenciamento de status dos pedidos |
| `/supplier` | Listagem de fornecedores |
| `/supplier/new` | Cadastro de fornecedor |

---

## 🧩 Padrões de Design

- Repository Pattern
- Mapper Pattern
- Aggregate Root (`Order` controla `OrderItem`)
- Use Case Pattern
- Dependency Injection (container centralizado em `server/container.ts`)
- Factory Function (instanciação lazy do container)
- Cache Pattern (geolocalização por CEP)

---

## 🐳 Tech Stack

| Tecnologia | Uso |
|---|---|
| Next.js 15 | Frontend + Backend (App Router) |
| React 19 | UI |
| TypeScript 5 | Linguagem |
| NextAuth | Autenticação |
| Prisma 6 | ORM |
| PostgreSQL | Banco de dados |
| @prisma/adapter-pg | Adapter de conexão |
| Docker Compose | Ambiente de banco de dados |
| API CEP Aberto v3 | Geolocalização por CEP |

---

## ⚙️ Configuração

### 1. Clonar repositório

```bash
git clone https://github.com/your-username/techfood.git
cd techfood
```

### 2. Subir banco de dados

```bash
docker-compose up -d
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Configurar variáveis de ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/techfood"
CEP_ABERTO_TOKEN=seu_token_aqui
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=http://localhost:3000
```

### 5. Executar migrations

```bash
npx prisma migrate dev
```

### 6. Iniciar aplicação

```bash
npm run dev
```

---

## 📌 Funcionalidades Implementadas

- ✅ Autenticação com NextAuth (perfis: admin, cliente, fornecedor)
- ✅ Dashboards por perfil
- ✅ Gestão de Produtos (CRUD completo por fornecedor)
- ✅ Gestão de Clientes (cadastro, busca por CPF, atualização de endereço)
- ✅ Gestão de Fornecedores (cadastro com CNPJ e coordenadas geográficas)
- ✅ Gestão de Pedidos (fluxo completo de 5 steps)
- ✅ Pagamento de pedidos (`PayOrderUseCase`)
- ✅ Atualização de status do pedido (`UpdateOrderStatusUseCase`)
- ✅ Controle de estoque em tempo real
- ✅ Soft delete em produtos
- ✅ Cálculo de frete por distância (Haversine)
- ✅ Cache de geolocalização por CEP no banco de dados
- ✅ Integração com API CEP Aberto (autenticada)
- ✅ Transações atômicas (estoque + pedido)
- ✅ Validações de domínio (CPF, CNPJ, CEP, email, telefone, coordenadas)
- ✅ Sanitização de inputs nas APIs
- ✅ Validação UUID nas rotas
- ✅ Paginação nas listagens
- ✅ Clean Architecture + DDD

---

## 🚀 Próximas Melhorias

- Testes unitários dos Use Cases
- Domain events
- Notificações em tempo real
- Relatórios e métricas no dashboard admin

---

## 🤝 Contribuindo

1. Siga a arquitetura em camadas
2. Mantenha o domínio isolado de dependências externas
3. Adicione regras de negócio dentro das entidades
4. Use repositórios para persistência
5. Evite uso direto do Prisma fora da infraestrutura

---

## 📄 Licença

MIT License

---

## 👨‍💻 Autor

Desenvolvido como **referência profissional de arquitetura** com Next.js, Clean Architecture e DDD.

# 🍕 TechFood — Order Management System

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)]
[![React](https://img.shields.io/badge/React-19-blue?logo=react)]
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)]
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)]
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)]
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture%20%2B%20DDD-green)]
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)]

---

## 🚀 Visão Geral

**TechFood** é um sistema fullstack de gestão de pedidos para restaurantes e food services, construído com **Next.js 16**, seguindo os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**.

---

## 🧠 Arquitetura

```text
src/
 ├── app/                        # UI + API Routes (Next.js App Router)
 │   ├── api/                    # Endpoints REST
 │   │   ├── customer/           # GET, POST, PATCH
 │   │   ├── orders/             # GET, POST
 │   │   ├── products/           # GET, POST, PUT, DELETE
 │   │   ├── supplier/           # GET, POST
 │   │   └── frete/              # GET (cálculo de frete)
 │   ├── customer/               # Páginas de clientes
 │   ├── orders/                 # Páginas de pedidos
 │   ├── products/               # Páginas de produtos
 │   └── supplier/               # Páginas de fornecedores
 ├── domain/                     # Entidades + Regras de Negócio
 │   ├── entities/               # Product, Customer, Order, OrderItem, Supplier
 │   ├── enums/                  # OrderStatus
 │   ├── repositories/           # Interfaces dos repositórios
 │   └── services/               # FreteService (Haversine)
 ├── infrastructure/             # Prisma + Repositórios + Mappers + Serviços
 │   ├── database/               # TransactionManager
 │   ├── mappers/                # Mapeamento domínio ↔ Prisma
 │   ├── repositories/           # Implementações Prisma
 │   └── services/               # CepService (API CEP Aberto)
 └── server/                     # Use Cases + Container DI
     └── usecases/               # CreateOrder, CreateProduct, CreateCustomer, CreateSupplier
```

---

## 🧱 Camadas

### 🔹 Domínio
- Entidades: `Product`, `Customer`, `Order`, `OrderItem`, `Supplier`
- Validações no construtor (CPF, email, CEP, telefone, CNPJ, coordenadas)
- Sem dependências externas

### 🔹 Aplicação (Use Cases)
- `CreateOrderUseCase` — com transação atômica via `TransactionManager`
- `CreateProductUseCase` — vinculado a um `Supplier`
- `CreateCustomerUseCase` — com validações de unicidade
- `CreateSupplierUseCase` — com validação de CNPJ

### 🔹 Infraestrutura
- Prisma ORM com adapter `@prisma/adapter-pg`
- Repositórios: `PrismaProductRepository`, `PrismaCustomerRepository`, `PrismaOrderRepository`, `PrismaOrderItemRepository`, `PrismaSupplierRepository`, `GeolocalizacaoRepository`
- `CepService` — integração com API CEP Aberto (autenticada por token)
- `FreteService` — cálculo de distância via fórmula de Haversine

### 🔹 Interface (Next.js)
- API Routes com sanitização de inputs e validação UUID
- Server Components para listagens
- Client Components para formulários e interações

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
| `Supplier` | id, razaoSocial, cnpj, email, latitude, longitude |
| `Geolocalizacao` | cep (PK), latitude, longitude |

---

## 📡 API Routes

| Método | Rota | Descrição |
|---|---|---|
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
| `POST` | `/api/orders` | Cria pedido |
| `GET` | `/api/frete?cep=&supplierId=` | Calcula frete com cache de geolocalização |

---

## 🖥️ Páginas UI

| Rota | Descrição |
|---|---|
| `/` | Landing page do TechFood |
| `/products` | Listagem de produtos com paginação e toggle |
| `/products/new` | Cadastro de produto (identificação por CNPJ do fornecedor) |
| `/products/manage` | CRUD completo de produtos por fornecedor |
| `/customer` | Listagem de clientes |
| `/customer/new` | Cadastro de cliente |
| `/orders` | Listagem de pedidos com subtotal, frete e total |
| `/orders/new` | Criação de pedido (5 steps: cliente → endereço → fornecedor → produtos → finalizar) |
| `/supplier` | Listagem de fornecedores |
| `/supplier/new` | Cadastro de fornecedor |

---

## 🧩 Padrões de Design

- Repository Pattern
- Mapper Pattern
- Aggregate Root (`Order` controla `OrderItem`)
- Use Case Pattern
- Dependency Injection (container centralizado)
- Factory Function (instanciação lazy do container)
- Cache Pattern (geolocalização por CEP)

---

## 🐳 Tech Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16 | Frontend + Backend (App Router) |
| React | 19 | UI |
| TypeScript | 5 | Linguagem |
| Prisma | 6 | ORM |
| PostgreSQL | — | Banco de dados |
| @prisma/adapter-pg | 6 | Adapter de conexão |
| API CEP Aberto | v3 | Geolocalização por CEP |

---

## ⚙️ Configuração

### 1. Clonar repositório

```bash
git clone https://github.com/your-username/techfood.git
cd techfood
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/techfood"
CEP_ABERTO_TOKEN=seu_token_aqui
```

### 4. Executar migrations

```bash
npx prisma migrate dev
```

### 5. Iniciar aplicação

```bash
npm run dev
```

---

## 📌 Funcionalidades Implementadas

- ✅ Gestão de Produtos (CRUD completo por fornecedor)
- ✅ Gestão de Clientes (cadastro, busca por CPF, atualização de endereço)
- ✅ Gestão de Fornecedores (cadastro com CNPJ e coordenadas geográficas)
- ✅ Gestão de Pedidos (fluxo completo de 5 steps)
- ✅ Controle de estoque em tempo real
- ✅ Soft delete em todas as entidades
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

- Workflow de status do pedido (PENDING → DELIVERED)
- Autenticação e autorização
- Domain events
- Testes unitários dos Use Cases
- Dashboard administrativo
- Notificações em tempo real

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

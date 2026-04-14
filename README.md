# 📦 Order Management System

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)]
[![React](https://img.shields.io/badge/React-19-blue?logo=react)]
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)]
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)]
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)]
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture-green)]
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)]

---

## 🚀 Overview

A **fullstack Order Management System** built with **Next.js**, following **Clean Architecture** and **Domain-Driven Design (DDD)** principles.

This project is designed as a **scalable and maintainable foundation** for real-world applications, focusing on:

* Separation of concerns
* Business rule encapsulation
* Testability
* Scalability

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

* [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
* [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🧠 Architecture

```text
src/
 ├── app/                  # UI + API Routes (Next.js)
 ├── server/               # Use Cases (Application Layer)
 ├── domain/               # Entities + Business Rules
 ├── infrastructure/       # Prisma + Repositories + Mappers
```

---

## 🧱 Layers Explained

### 🔹 Domain (Core)

* Entities: `Product`, `Customer`, `Order`, `OrderItem`
* Business rules and validations
* No external dependencies

---

### 🔹 Application (Use Cases)

* Orchestrates system behavior
* Example: `CreateOrderUseCase`
* Uses repositories to access data

---

### 🔹 Infrastructure

* Prisma ORM
* Repository implementations
* Database mapping

---

### 🔹 Interface (Next.js)

* API Routes (`/api/orders`)
* UI components

---

## 🔄 Order Creation Flow

```text
POST /api/orders
    ↓
Route Handler
    ↓
CreateOrderUseCase
    ↓
Validate Customer
    ↓
Fetch Products
    ↓
Validate Stock
    ↓
Create Order Entity
    ↓
Add Items
    ↓
Update Stock (atomic)
    ↓
Persist Order
```

---

## 🧾 Business Rules

### 📦 Product

* Stock control (`quantidade`)
* Soft delete (`deletedAt`)
* Prevents negative stock

---

### 👤 Customer

* Must exist to create an order
* Contains address and CEP (for future shipping logic)

---

### 🧾 Order

* Must contain at least one item
* Total is calculated internally
* Controlled status workflow

---

### 🧾 OrderItem

* Quantity > 0
* Price > 0
* Internal subtotal calculation

---

## 🔒 Concurrency Control (Stock)

Atomic stock update using:

```ts
updateMany({
  where: {
    id: productId,
    quantidade: { gte: quantidade }
  }
})
```

### Benefits

* Prevents race conditions
* Ensures data consistency
* Avoids negative stock

---

## 🧩 Design Patterns

* Repository Pattern
* Mapper Pattern
* Aggregate Root (Order)
* Use Case Pattern
* Dependency Injection

---

## 🧪 Testing Strategy

* Unit tests for Use Cases
* Mocked repositories
* Isolated domain testing

---

## 🐳 Tech Stack

* **Frontend/Backend:** Next.js (App Router)
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Architecture:** Clean Architecture + DDD

---

## 📌 Current Features

* ✅ Product management
* ✅ Customer management
* ✅ Stock control
* ✅ Order creation
* ✅ Multiple items per order
* ✅ Soft delete
* ✅ Clean architecture structure

---

## 🚀 Future Improvements

* Shipping calculation by CEP
* Domain events
* Unit of Work (transactions)
* Authentication & Authorization
* Admin dashboard
* Integration with external APIs

---

## ⚙️ Getting Started

### 1. Clone repository

```bash
git clone https://github.com/your-username/order-management.git
cd order-management
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup environment

Create `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db"
```

---

### 4. Run migrations

```bash
npx prisma migrate dev
```

---

### 5. Start application

```bash
npm run dev
```

---

## 📡 API Example

### Create Order

```http
POST /api/orders
```

### Body

```json
{
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantidade": 2
    }
  ]
}
```

---

## 🧠 Architectural Decisions

### Why not CRUD?

Because the system is **business-driven**, not database-driven.

---

### Why Aggregate Root?

`Order` controls `OrderItem` to ensure consistency.

---

### Why Use Cases?

To isolate **application logic** from infrastructure.

---

## 🤝 Contributing

1. Follow the architecture
2. Keep domain isolated
3. Add business rules inside entities
4. Use repositories for persistence
5. Avoid direct Prisma usage outside infrastructure

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed as a **professional architecture reference project**.

---

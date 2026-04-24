-- Criar Users para Customers sem User vinculado
-- Senha padrão: 'trocar123' (hash bcrypt gerado externamente)
-- O customer deverá redefinir a senha no primeiro acesso

INSERT INTO "User" (id, email, password, role, "customerId", "supplierId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  c.email,
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: 'password'
  'CUSTOMER',
  c.id,
  NULL,
  NOW(),
  NOW()
FROM "Customer" c
WHERE NOT EXISTS (
  SELECT 1 FROM "User" u WHERE u."customerId" = c.id
)
AND c."deletedAt" IS NULL;

-- Criar Users para Suppliers sem User vinculado
INSERT INTO "User" (id, email, password, role, "customerId", "supplierId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  s.email,
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: 'password'
  'SUPPLIER',
  NULL,
  s.id,
  NOW(),
  NOW()
FROM "Supplier" s
WHERE NOT EXISTS (
  SELECT 1 FROM "User" u WHERE u."supplierId" = s.id
)
AND s."deletedAt" IS NULL;

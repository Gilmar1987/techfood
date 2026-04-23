-- AlterTable: add cep with default for existing rows
ALTER TABLE "Supplier" ADD COLUMN "cep" TEXT NOT NULL DEFAULT '00000000';
ALTER TABLE "Supplier" ALTER COLUMN "cep" DROP DEFAULT;

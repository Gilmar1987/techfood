-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "frete" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Geolocalizacao" (
    "cep" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Geolocalizacao_pkey" PRIMARY KEY ("cep")
);

-- CreateIndex
CREATE INDEX "Geolocalizacao_cep_idx" ON "Geolocalizacao"("cep");

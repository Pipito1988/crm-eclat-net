-- CreateEnum
CREATE TYPE "public"."DevisStatus" AS ENUM ('ENVIADO', 'ACEITE', 'RECUSADO', 'RASCUNHO');

-- CreateEnum
CREATE TYPE "public"."ClientStatus" AS ENUM ('ATIVO', 'ESPECULATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "public"."BillingFrequency" AS ENUM ('MENSAL', 'SEMANAL', 'PAGAMENTO_UNICO', 'OUTRO');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('TRANSFERENCIA', 'CHEQUE', 'DINHEIRO', 'OUTRO');

-- CreateEnum
CREATE TYPE "public"."ContractStatus" AS ENUM ('COM_CONTRATO', 'SEM_CONTRATO', 'A_NEGOCIAR');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientStatus" "public"."ClientStatus" NOT NULL DEFAULT 'ATIVO',
    "clientType" TEXT NOT NULL DEFAULT 'Imovel',
    "startDate" TIMESTAMP(3),
    "serviceAddress" TEXT,
    "billingAddress" TEXT,
    "value" DECIMAL(12,2) NOT NULL,
    "frequency" "public"."BillingFrequency" NOT NULL DEFAULT 'MENSAL',
    "method" "public"."PaymentMethod" NOT NULL DEFAULT 'TRANSFERENCIA',
    "service" TEXT,
    "contract" "public"."ContractStatus" NOT NULL DEFAULT 'SEM_CONTRATO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "salary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Devis" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3),
    "valid" TIMESTAMP(3),
    "status" "public"."DevisStatus" NOT NULL DEFAULT 'ENVIADO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "category" TEXT,
    "freq" TEXT,
    "weekday" TEXT,
    "time" TEXT,
    "notes" TEXT,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Devis" ADD CONSTRAINT "Devis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

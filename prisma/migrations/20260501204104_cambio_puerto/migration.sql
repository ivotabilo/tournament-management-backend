/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Equipo" ADD COLUMN     "confirmado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Torneo" ADD COLUMN     "fechaCierreInscripcion" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteGestion" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_verificationToken_key" ON "Usuario"("verificationToken");

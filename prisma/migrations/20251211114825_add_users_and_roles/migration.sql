/*
  Warnings:

  - You are about to drop the column `imagenUrl` on the `Equipo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `Equipo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CAPTAIN');

-- AlterTable
ALTER TABLE "Equipo" DROP COLUMN "imagenUrl",
ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CAPTAIN',
    "equipoId" INTEGER,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_equipoId_key" ON "Usuario"("equipoId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_nombre_key" ON "Equipo"("nombre");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

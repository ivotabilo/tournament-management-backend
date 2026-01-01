/*
  Warnings:

  - You are about to drop the column `resultado` on the `EstadisticaJugador` table. All the data in the column will be lost.
  - Made the column `empate` on table `Partido` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EstadisticaJugador" DROP COLUMN "resultado";

-- AlterTable
ALTER TABLE "Partido" ALTER COLUMN "empate" SET NOT NULL,
ALTER COLUMN "scoreEquipoA" DROP DEFAULT,
ALTER COLUMN "scoreEquipoB" DROP DEFAULT;

-- DropEnum
DROP TYPE "ResultadoPartido";

-- CreateTable
CREATE TABLE "Mapa" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Mapa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mapa_nombre_key" ON "Mapa"("nombre");

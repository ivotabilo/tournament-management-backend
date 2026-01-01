-- CreateEnum
CREATE TYPE "EstadoEquipo" AS ENUM ('EN_PIE', 'FUERA');

-- AlterTable
ALTER TABLE "Partido" ADD COLUMN     "empate" BOOLEAN DEFAULT false,
ADD COLUMN     "scoreEquipoA" INTEGER DEFAULT 0,
ADD COLUMN     "scoreEquipoB" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "TablaPosiciones" ADD COLUMN     "estado" "EstadoEquipo" NOT NULL DEFAULT 'EN_PIE';

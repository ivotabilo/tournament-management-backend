-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('TITULAR', 'SUPLENTE', 'COACH');

-- CreateTable
CREATE TABLE "Equipo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "imagenUrl" TEXT,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jugador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "equipoId" INTEGER,

    CONSTRAINT "Jugador_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Jugador" ADD CONSTRAINT "Jugador_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

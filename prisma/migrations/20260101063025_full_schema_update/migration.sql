-- CreateEnum
CREATE TYPE "ResultadoPartido" AS ENUM ('VICTORIA', 'DERROTA', 'EMPATE');

-- CreateTable
CREATE TABLE "Torneo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Torneo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partido" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "torneoId" INTEGER NOT NULL,
    "equipoAId" INTEGER NOT NULL,
    "equipoBId" INTEGER NOT NULL,
    "ganadorId" INTEGER,

    CONSTRAINT "Partido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadisticaJugador" (
    "id" SERIAL NOT NULL,
    "partidoId" INTEGER NOT NULL,
    "jugadorId" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "muertes" INTEGER NOT NULL DEFAULT 0,
    "asistencias" INTEGER NOT NULL DEFAULT 0,
    "kda" DOUBLE PRECISION,
    "resultado" "ResultadoPartido" NOT NULL,

    CONSTRAINT "EstadisticaJugador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TablaPosiciones" (
    "id" SERIAL NOT NULL,
    "torneoId" INTEGER NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TablaPosiciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EstadisticaJugador_partidoId_jugadorId_key" ON "EstadisticaJugador"("partidoId", "jugadorId");

-- CreateIndex
CREATE UNIQUE INDEX "TablaPosiciones_torneoId_equipoId_key" ON "TablaPosiciones"("torneoId", "equipoId");

-- AddForeignKey
ALTER TABLE "Partido" ADD CONSTRAINT "Partido_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "Torneo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partido" ADD CONSTRAINT "Partido_equipoAId_fkey" FOREIGN KEY ("equipoAId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partido" ADD CONSTRAINT "Partido_equipoBId_fkey" FOREIGN KEY ("equipoBId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partido" ADD CONSTRAINT "Partido_ganadorId_fkey" FOREIGN KEY ("ganadorId") REFERENCES "Equipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadisticaJugador" ADD CONSTRAINT "EstadisticaJugador_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "Partido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadisticaJugador" ADD CONSTRAINT "EstadisticaJugador_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TablaPosiciones" ADD CONSTRAINT "TablaPosiciones_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "Torneo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TablaPosiciones" ADD CONSTRAINT "TablaPosiciones_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

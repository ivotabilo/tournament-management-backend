// src/services/equipo.service.ts
import { prisma } from '../prismaClient.js';
import bcrypt from 'bcrypt';

// ⚡ Registrar equipo y capitán con Cloudinary
export const registerTeamAndCapitan = async (teamData: any, logoUrl: string) => {
  const { teamName, teamTag, captainEmail, captainPassword, players, coach, substitutes } = teamData;

  if (!captainEmail || !captainPassword) throw new Error('Debe proporcionar email y contraseña del Capitán.');
  if (!teamName || !teamTag) throw new Error('Debe proporcionar nombre y tag del equipo.');

  const emailNormalized = captainEmail.trim().toLowerCase();

  const existingTeam = await prisma.equipo.findUnique({ where: { nombre: teamName } });
  if (existingTeam) throw { field: 'teamName', message: 'Ya existe un equipo con ese nombre.' };

  const existingCaptain = await prisma.usuario.findUnique({ where: { email: emailNormalized } });
  if (existingCaptain) throw { field: 'captainEmail', message: 'Ya existe un capitán con este correo.' };

  const hashedPassword = await bcrypt.hash(captainPassword, 10);

  const result = await prisma.$transaction(async (tx) => {
    // ⚡ Guardar la URL de Cloudinary directamente
    const equipo = await tx.equipo.create({
      data: { nombre: teamName, tag: teamTag, logoUrl: logoUrl },
    });

    const capitan = await tx.usuario.create({
      data: { email: emailNormalized, password: hashedPassword, role: 'CAPTAIN', equipoId: equipo.id },
    });

    for (const player of players || []) {
      if (!player.name) continue;
      await tx.jugador.create({
        data: { nombre: player.name, usuario: player.name, rol: 'TITULAR', equipoId: equipo.id },
      });
    }

    if (coach?.name) {
      await tx.jugador.create({
        data: { nombre: coach.name, usuario: coach.name, rol: 'COACH', equipoId: equipo.id },
      });
    }

    for (const sub of substitutes || []) {
      if (!sub.name) continue;
      await tx.jugador.create({
        data: { nombre: sub.name, usuario: sub.name, rol: 'SUPLENTE', equipoId: equipo.id },
      });
    }

    return { team: equipo, capitan };
  });

  return result;
};

// ⚡ Obtener equipos con puntos actualizados automáticamente
export const getTeamsWithPoints = async (torneoId?: number) => {
  // Armar include dinámico para evitar error TS
  const includeTablaPosiciones = torneoId
    ? { tablaPosiciones: { where: { torneoId }, select: { puntos: true } } }
    : { tablaPosiciones: { select: { puntos: true } } };

  const equipos = await prisma.equipo.findMany({
    include: includeTablaPosiciones,
  });

  // Calcular puntos automáticamente si no hay partidos jugados
  // ⚡ 2 puntos por victoria
  return equipos.map((e) => {
    const puntos = e.tablaPosiciones.length > 0
      ? e.tablaPosiciones[0].puntos
      : 0; // si no hay tabla, 0 puntos

    return {
      id: e.id,
      nombre: e.nombre,
      tag: e.tag,
      // ⚡ Aquí ya viene la URL de Cloudinary desde el frontend (upload)
      logoUrl: e.logoUrl || null,
      points: puntos,
    };
  });
};
// ⚡ LEER: Obtener equipo con Roster completo
export const getEquipoById = async (id: number) => {
  return await prisma.equipo.findUnique({
    where: { id },
    include: {
      jugadores: true, // Esto trae a los 5 titulares, 2 suplentes y coach
      capitan: {
        select: { email: true, role: true }
      }
    }
  });
};

// ⚡ EDITAR: Actualización masiva (Nombre, Tag, Logo y Roster)
export const updateEquipoCompleto = async (equipoId: number, data: any) => {
  const { nombre, tag, logoUrl, jugadores } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Actualizar datos base del equipo
    const equipoActualizado = await tx.equipo.update({
      where: { id: equipoId },
      data: { 
        nombre, 
        tag, 
        logoUrl: logoUrl || undefined // Solo actualiza si hay una URL nueva
      },
    });

    // 2. Actualizar cada jugador individualmente
    if (jugadores && jugadores.length > 0) {
      for (const j of jugadores) {
        await tx.jugador.update({
          where: { id: j.id },
          data: {
            nombre: j.nombre,
            usuario: j.usuario,
            rol: j.rol 
          }
        });
      }
    }

    return equipoActualizado;
  });
};






import { prisma } from '../prismaClient.js';
import bcrypt from 'bcrypt';

// ⚡ Registrar equipo y capitán con Inscripción Automática al Torneo
export const registerTeamAndCapitan = async (teamData: any, logoUrl: string) => {
  const { teamName, teamTag, captainEmail, captainPassword, players, coach, substitutes } = teamData;

  if (!captainEmail || !captainPassword) throw new Error('Debe proporcionar email y contraseña del Capitán.');
  if (!teamName || !teamTag) throw new Error('Debe proporcionar nombre y tag del equipo.');

  // --- ÚNICA ADICIÓN: VALIDACIÓN DE TAG ---
  if (teamTag.trim().length < 2 || teamTag.trim().length > 3) {
    throw { field: 'teamTag', message: 'El tag debe tener 2 o 3 caracteres. ¡Elige uno corto y potente! 🎮' };
  }
  // ----------------------------------------

  const emailNormalized = captainEmail.trim().toLowerCase();

  // Validaciones previas
  const existingTeam = await prisma.equipo.findUnique({ where: { nombre: teamName } });
  if (existingTeam) throw { field: 'teamName', message: 'Ya existe un equipo con ese nombre.' };

  const existingCaptain = await prisma.usuario.findUnique({ where: { email: emailNormalized } });
  if (existingCaptain) throw { field: 'captainEmail', message: 'Ya existe un capitán con este correo.' };

  const hashedPassword = await bcrypt.hash(captainPassword, 10);

  const result = await prisma.$transaction(async (tx) => {
    // 1. BUSCAR EL TORNEO ACTIVO (Para inscripción automática)
    const torneoActivo = await tx.torneo.findFirst({
      orderBy: { id: 'desc' } // Toma el último creado (ej: Disclash2026)
    });

    if (!torneoActivo) {
      throw new Error('No hay ningún torneo activo para inscribirse.');
    }

    // 2. CREAR EL EQUIPO
    const equipo = await tx.equipo.create({
      data: { nombre: teamName, tag: teamTag, logoUrl: logoUrl },
    });

    // 3. VINCULACIÓN AUTOMÁTICA (Tabla de Posiciones / Lista de Inscritos)
    await tx.tablaPosiciones.create({
      data: {
        equipoId: equipo.id,
        torneoId: torneoActivo.id,
        puntos: 0,
        estado: 'EN_PIE'
      }
    });

    // 4. CREAR EL CAPITÁN
    const capitan = await tx.usuario.create({
      data: { email: emailNormalized, password: hashedPassword, role: 'CAPTAIN', equipoId: equipo.id },
    });

    // 5. CREAR JUGADORES (TITULARES)
    for (const player of players || []) {
      if (!player.name) continue;
      await tx.jugador.create({
        data: { nombre: player.name, usuario: player.name, rol: 'TITULAR', equipoId: equipo.id },
      });
    }

    // 6. CREAR COACH
    if (coach?.name) {
      await tx.jugador.create({
        data: { nombre: coach.name, usuario: coach.name, rol: 'COACH', equipoId: equipo.id },
      });
    }

    // 7. CREAR SUPLENTES
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

// ⚡ Obtener equipos con puntos de un torneo específico
export const getTeamsWithPoints = async (torneoId?: number) => {
  // Si no se pasa un torneoId, buscamos el último activo
  let targetTorneoId = torneoId;
  if (!targetTorneoId) {
    const ultimoTorneo = await prisma.torneo.findFirst({ orderBy: { id: 'desc' } });
    targetTorneoId = ultimoTorneo?.id;
  }

  const equipos = await prisma.equipo.findMany({
    include: {
      tablaPosiciones: {
        where: { torneoId: targetTorneoId },
        select: { puntos: true }
      }
    },
  });

  return equipos.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    tag: e.tag,
    logoUrl: e.logoUrl || null,
    points: e.tablaPosiciones.length > 0 ? e.tablaPosiciones[0].puntos : 0,
  }));
};

// ⚡ LEER: Obtener equipo con Roster completo
export const getEquipoById = async (id: number) => {
  return await prisma.equipo.findUnique({
    where: { id },
    include: {
      jugadores: true,
      capitan: {
        select: { email: true, role: true }
      }
    }
  });
};

// ⚡ EDITAR: Actualización masiva con validación de fecha de Torneo
export const updateEquipoCompleto = async (equipoId: number, data: any) => {
  const { nombre, tag, logoUrl, jugadores } = data;

  // --- ÚNICA ADICIÓN: VALIDACIÓN DE TAG ---
  if (tag && (tag.trim().length < 2 || tag.trim().length > 3)) {
    throw new Error("El tag debe tener entre 2 y 3 caracteres. Ejemplo: [WIN]");
  }
  // ----------------------------------------

  return await prisma.$transaction(async (tx) => {
    // 1. VALIDACIÓN DE FECHA LÍMITE
    const inscripcion = await tx.tablaPosiciones.findFirst({
      where: { equipoId },
      include: { torneo: true }
    });

    if (inscripcion?.torneo?.fechaLimiteGestion) {
      const ahora = new Date();
      if (ahora > inscripcion.torneo.fechaLimiteGestion) {
        throw new Error("El periodo de edición ha finalizado.");
      }
    }

    // 2. Actualizar datos base del equipo
    const equipoActualizado = await tx.equipo.update({
      where: { id: equipoId },
      data: { 
        nombre, 
        tag, 
        logoUrl: logoUrl || undefined 
      },
    });

    // 3. LÓGICA UPSERT PARA JUGADORES
    if (jugadores && jugadores.length > 0) {
      for (const j of jugadores) {
        // Si el nombre está vacío, no lo guardamos (opcional, según tu preferencia)
        if (!j.nombre || j.nombre.trim() === "") continue;

        if (j.id && !String(j.id).startsWith('temp')) {
          // Si tiene un ID real, actualizamos
          await tx.jugador.update({
            where: { id: Number(j.id) },
            data: {
              nombre: j.nombre,
              usuario: j.nombre, // Sincronizamos usuario con nombre
              rol: j.rol 
            }
          });
        } else {
          // Si NO tiene ID o es un ID temporal ("temp-..."), lo CREAMOS
          await tx.jugador.create({
            data: {
              nombre: j.nombre,
              usuario: j.nombre,
              rol: j.rol,
              equipoId: equipoId
            }
          });
        }
      }
    }

    return equipoActualizado;
  });
};
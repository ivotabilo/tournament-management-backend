import { prisma } from '../prismaClient.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer'; // ✅ Reemplazado Resend por Nodemailer

// ✅ Configuración del motor de envío (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

  // 🛡️ GENERAR TOKEN DE VERIFICACIÓN
  const verificationToken = crypto.randomUUID();

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

    // 4. CREAR EL CAPITÁN (Incluyendo isVerified y Token)
    const capitan = await tx.usuario.create({
      data: { 
        email: emailNormalized, 
        password: hashedPassword, 
        role: 'CAPTAIN', 
        equipoId: equipo.id,
        isVerified: false,
        verificationToken: verificationToken
      },
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

  // 📧 ENVÍO DE EMAIL CON GMAIL (NODEMAILER)
  try {
    const confirmLink = `${process.env.NEXT_PUBLIC_API_URL}/equipos/confirmar?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: `"Torneo Valorant" <${process.env.EMAIL_USER}>`,
      to: emailNormalized,
      subject: '📧 Verifica tu correo - Inscripción Torneo',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
          <h2 style="color: #ff4655;">¡Hola Capitán!</h2>
          <p>Has registrado al equipo <strong>${teamName}</strong> satisfactoriamente.</p>
          <p>Para confirmar tu inscripción y aparecer en la tabla oficial, haz clic en el botón:</p>
          <a href="${confirmLink}" 
             style="background: #ff4655; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            VERIFICAR MI CORREO
          </a>
        </div>
      `
    });
  } catch (error) {
    console.error("Error enviando email con Gmail:", error);
  }

  return result;
};

// ⚡ Obtener equipos con puntos de un torneo específico (FILTRADO POR VERIFICACIÓN)
export const getTeamsWithPoints = async (torneoId?: number) => {
  let targetTorneoId = torneoId;
  if (!targetTorneoId) {
    const ultimoTorneo = await prisma.torneo.findFirst({ orderBy: { id: 'desc' } });
    targetTorneoId = ultimoTorneo?.id;
  }

  const equipos = await prisma.equipo.findMany({
    where: {
      capitan: {
        isVerified: true // 🛡️ Solo equipos donde el capitán confirmó el correo
      }
    },
    include: {
      jugadores: true, // ✅ Cambio solicitado: Se incluyen jugadores
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
    jugadores: e.jugadores, // ✅ Cambio solicitado: Se retornan los jugadores
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

  // --- VALIDACIÓN DE TAG EN EDICIÓN ---
  if (tag) {
    const cleanTag = tag.trim();
    if (cleanTag.length < 2 || cleanTag.length > 3) {
      throw { 
        field: 'teamTag', 
        message: 'El tag debe tener 2 o 3 caracteres. ¡Elige uno corto y potente! 🎮' 
      };
    }
  }

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

    // --- 🚀 PASO DE SINCRONIZACIÓN: ELIMINAR LOS QUE YA NO ESTÁN ---
    if (jugadores) {
      // Obtenemos los IDs de los jugadores que el capitán MANTUVO en el formulario
      const idsQueSeQuedan = jugadores
        .filter((j: any) => j.id && !String(j.id).startsWith('temp') && j.nombre?.trim() !== "")
        .map((j: any) => Number(j.id));

      // Eliminamos de la DB a cualquier jugador de este equipo que NO esté en la lista enviada
      // Esto permite que si el capitán borra un nombre, el jugador desaparezca de la base de datos
      await tx.jugador.deleteMany({
        where: {
          equipoId: equipoId,
          id: { notIn: idsQueSeQuedan }
        }
      });
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
        // Si el nombre está vacío, lo saltamos (ya se encargó el deleteMany de arriba)
        if (!j.nombre || j.nombre.trim() === "") continue;

        if (j.id && !String(j.id).startsWith('temp')) {
          await tx.jugador.update({
            where: { id: Number(j.id) },
            data: {
              nombre: j.nombre,
              usuario: j.nombre,
              rol: j.rol 
            }
          });
        } else {
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
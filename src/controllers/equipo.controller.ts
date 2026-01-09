// src/controllers/equipo.controller.ts
import type { Request, Response } from 'express';
import { registerTeamAndCapitan, getTeamsWithPoints } from '../services/equipo.service.js';
import { getEquipoById, updateEquipoCompleto } from '../services/equipo.service.js';
import { prisma } from '../prismaClient.js';

// ⚡ Crear equipo con Cloudinary
export const crearEquipo = async (req: Request, res: Response) => {
  const imageFile = req.file as any;

  if (!req.body.data) return res.status(400).json({ submit: 'Faltan datos.' });
  if (!imageFile) return res.status(400).json({ teamImage: 'Se requiere imagen.' });

  let teamData;
  try { 
    teamData = JSON.parse(req.body.data); 
  } catch {
    return res.status(400).json({ submit: 'JSON inválido.' });
  }

  try {
    const result = await registerTeamAndCapitan(teamData, imageFile.path);

    return res.status(201).json({ 
      message: 'Registrado con éxito.', 
      equipo: result.team,
      capitan: result.capitan
    });
  } catch (error: any) {
    console.error(error);

    const fieldErrors: { [key: string]: string } = {};

    // --- NUEVO: Capturar errores de validación personalizados (como el del Tag) ---
    if (error.field) {
      fieldErrors[error.field] = error.message;
      return res.status(400).json(fieldErrors);
    }

    // Si viene un error de Prisma (Duplicados)
    if (error.code === 'P2002' && error.meta?.target) {
      error.meta.target.forEach((field: string) => {
        if (field === 'nombre') fieldErrors.teamName = 'Ya existe un equipo con ese nombre.';
        if (field === 'email') fieldErrors.captainEmail = 'Ya existe un capitán con ese correo.';
      });
    } else {
      // Captura el throw Error del Service si no tiene .field
      fieldErrors.submit = error.message || 'Error desconocido.';
    }

    return res.status(409).json(fieldErrors);
  }
};

// ⚡ Obtener equipos con tabla y puntos actualizados
export const obtenerEquiposTabla = async (req: Request, res: Response) => {
  try {
    const torneoId = req.query.torneoId ? Number(req.query.torneoId) : undefined;
    const equipos = await getTeamsWithPoints(torneoId);
    res.status(200).json(equipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener equipos' });
  }
};

// ⚡ Controlador para ver "Mi Equipo"
export const obtenerMiEquipo = async (req: any, res: Response) => {
  try {
    const equipo = await getEquipoById(Number(req.params.id));
    if (!equipo) return res.status(404).json({ error: "Equipo no encontrado" });

    if (req.user.role !== 'ADMIN' && req.user.equipoId !== equipo.id) {
      return res.status(403).json({ error: "No autorizado" });
    }
    res.json(equipo);
  } catch (error) {
    res.status(500).json({ error: "Error de servidor" });
  }
};

// ⚡ Controlador para guardar cambios (con Cloudinary)
export const editarMiEquipo = async (req: any, res: Response) => {
  try {
    const equipoId = Number(req.params.id);

    if (req.user.role !== 'ADMIN' && req.user.equipoId !== equipoId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    let bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;

    if (req.file) {
      bodyData.logoUrl = req.file.path; 
    }

    const actualizado = await updateEquipoCompleto(equipoId, bodyData);
    res.json({ message: "¡Guardado correctamente! 🎉", equipo: actualizado });
  } catch (error: any) {
    console.error(error);
    // ⚡ Enviamos el error.message para que el 'alert' del frontend muestre el texto amigable
    res.status(400).json({ error: error.message || "Error al actualizar" });
  }
};
// src/controllers/equipo.controller.ts

export const confirmarEmail = async (req: Request, res: Response) => {
  const { token } = req.query; // Obtiene el token de la URL (?token=...)

  if (!token) return res.status(400).send("Falta el token de verificación.");

  try {
    // 1. Buscamos al usuario que tenga ese token
    const usuario = await prisma.usuario.findFirst({
      where: { verificationToken: String(token) }
    });

    if (!usuario) {
      return res.status(404).send("El enlace es inválido o ya expiró.");
    }

    // 2. Lo marcamos como verificado y borramos el token para que no se use de nuevo
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { 
        isVerified: true, 
        verificationToken: null 
      }
    });

    // 3. Respuesta visual para el usuario
    res.send(`
      <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
        <h1>¡Email verificado correctamente! 🎮</h1>
        <p>Tu equipo ya es oficial y aparecerá en la tabla del torneo.</p>
        <p>Ya puedes cerrar esta ventana.</p>
      </div>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al procesar la verificación.");
  }
};
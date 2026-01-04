// src/controllers/equipo.controller.ts
import type { Request, Response } from 'express';
import { registerTeamAndCapitan, getTeamsWithPoints } from '../services/equipo.service.js';
import { getEquipoById, updateEquipoCompleto } from '../services/equipo.service.js';

// ⚡ Crear equipo con Cloudinary
export const crearEquipo = async (req: Request, res: Response) => {
  // Multer + Cloudinary almacena la URL final en `req.file.path`
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
    // ⚡ Pasamos la URL completa de Cloudinary
    const result = await registerTeamAndCapitan(teamData, imageFile.path);

    return res.status(201).json({ 
      message: 'Registrado con éxito.', 
      equipo: result.team,
      capitan: result.capitan
    });
  } catch (error: any) {
    console.error(error);

    const fieldErrors: { [key: string]: string } = {};

    // Si viene un error de Prisma
    if (error.code === 'P2002' && error.meta?.target) {
      error.meta.target.forEach((field: string) => {
        if (field === 'nombre') fieldErrors.teamName = 'Ya existe un equipo con ese nombre.';
        if (field === 'email') fieldErrors.captainEmail = 'Ya existe un capitán con ese correo.';
      });
    } else {
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

    // Como la URL ya viene completa desde Cloudinary, no hace falta concatenar nada
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

    // Seguridad Middleware
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

    // Seguridad
    if (req.user.role !== 'ADMIN' && req.user.equipoId !== equipoId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Parsear datos (vienen de FormData)
    let bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;

    // Si hay una imagen nueva en Cloudinary, usamos esa URL
    if (req.file) {
      bodyData.logoUrl = req.file.path; 
    }

    const actualizado = await updateEquipoCompleto(equipoId, bodyData);
    res.json({ message: "Guardado correctamente", equipo: actualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar" });
  }
};
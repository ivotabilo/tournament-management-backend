// src/middlewares/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_muy_seguro_y_largo';

// Extendemos la interfaz de Request para poder guardar los datos del usuario logueado
export interface AuthRequest extends Request {
    user?: {
        userId: number;
        role: string;
        equipoId?: number;
    };
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded; // Guardamos los datos del token en el request
        next(); // El token es válido, seguimos al siguiente paso
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

// Middleware para verificar ROLES específicos
export const tieneRol = (roleRequerido: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== roleRequerido) {
            return res.status(403).json({ error: `No tienes permiso. Se requiere rol: ${roleRequerido}` });
        }
        next();
    };
};
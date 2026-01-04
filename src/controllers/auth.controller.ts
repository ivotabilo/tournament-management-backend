import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';

export const loginController = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    try {
        const usuario = await authService.validarUsuario(email, password);

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const token = authService.generarToken(usuario);

        return res.json({ 
            message: 'Login exitoso', 
            token, 
            role: usuario.role, 
            equipoId: usuario.equipoId 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};



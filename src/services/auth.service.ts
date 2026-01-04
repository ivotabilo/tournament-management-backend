import { prisma } from '../prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_muy_seguro_y_largo';

export const authService = {
    validarUsuario: async (email: string, password: string) => {
        const usuario = await prisma.usuario.findUnique({
            where: { email: email.trim().toLowerCase() }
        });

        if (!usuario) return null;

        const isPasswordValid = await bcrypt.compare(password.trim(), usuario.password);
        if (!isPasswordValid) return null;

        return usuario;
    },

    generarToken: (usuario: any) => {
        return jwt.sign(
            { 
                userId: usuario.id, 
                role: usuario.role, 
                equipoId: usuario.equipoId 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
    }
};
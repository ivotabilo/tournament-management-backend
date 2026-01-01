// src/routes/auth.routes.ts (Crea este archivo si no existe, o modifícalo)

import { Router } from 'express';
import { prisma } from '../prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// 🚨 IMPORTANTE: Define tu clave secreta para JWT
// En producción, esto debe estar en una variable de entorno (.env)
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_muy_seguro_y_largo'; 


// Endpoint de LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos.' });

    try {
        // Buscar usuario por email normalizado
        const usuario = await prisma.usuario.findUnique({
            where: { email: email.trim().toLowerCase() }
        });

        if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas.' });

        // Comparar contraseña con hash
        const isPasswordValid = await bcrypt.compare(password.trim(), usuario.password);

        if (!isPasswordValid) return res.status(401).json({ error: 'Credenciales inválidas.' });

        // Generar token JWT
        const token = jwt.sign(
            { userId: usuario.id, role: usuario.role, equipoId: usuario.equipoId },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({ message: 'Login exitoso', token, role: usuario.role, equipoId: usuario.equipoId });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor durante el login.' });
    }
});


export default router;

// NOTA: Recuerda conectar esta ruta en src/index.ts: app.use('/auth', authRoutes);
import { Router } from 'express';
import { loginController } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js'; // El vigilante
import { PrismaClient } from '@prisma/client'; // Para buscar al usuario real

const router = Router();
const prisma = new PrismaClient();

// RUTA PÚBLICA (Ya la tenías)
router.post('/login', loginController);

// RUTA PROTEGIDA (La que usará el Navbar para validar al usuario)
router.get('/me', verificarToken, async (req: any, res) => {
    try {
        // req.user viene del token ya validado por el middleware
        const usuario = await prisma.usuario.findUnique({
            where: { id: req.user.userId },
            select: { 
                id: true, 
                email: true, 
                role: true, 
                equipoId: true 
            }
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Si el token es real y el usuario existe en Neon, devolvemos su info
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
});

export default router;
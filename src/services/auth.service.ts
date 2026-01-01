import { prisma } from '../prismaClient.js';
import bcrypt from 'bcrypt';
export const validarCredenciales = async (email: string, password: string) => {
    const usuario = await prisma.usuario.findUnique({
        where: {email: email.trim().toLowerCase()}
    })
    // usuario incorrecto
    if (!usuario) {
    return null; 
    }
    const isPasswordValid = await bcrypt.compare(password.trim(), usuario.password);
      // 3️⃣ Password incorrecto
    if (!isPasswordValid) {
        return null; // o false
    }

    // 4️⃣ Credenciales válidas
    return usuario;

}
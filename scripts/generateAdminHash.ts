import bcrypt from 'bcrypt';
import { prisma } from '../src/prismaClient.js';

async function main() {
    // -----------------------------------------------------------
    // CONFIGURA AQUÍ TUS NUEVOS DATOS
    const nuevoEmail = 'sabriadmin@gmail.com'; // <--- CAMBIA ESTO
    const nuevoPassword = 'octubreuncrimen1'; // <--- CAMBIA ESTO
    // -----------------------------------------------------------

    // 1. Buscamos por el nuevo email para no duplicar
    const existeAdmin = await prisma.usuario.findUnique({
        where: { email: nuevoEmail }
    });

    if (existeAdmin) {
        console.log(`El usuario ${nuevoEmail} ya existe en Neon.`);
        return;
    }

    // 2. Generamos el hash con el nuevo password
    const hash = await bcrypt.hash(nuevoPassword, 10);

    // 3. Creamos el registro
    const admin = await prisma.usuario.create({
        data: {
            email: nuevoEmail,
            password: hash,
            role: 'ADMIN',
        }
    });

    console.log('✅ Usuario admin creado exitosamente:', admin.email);
}

main()
    .catch(e => {
        console.error('❌ Error al crear el admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect(); 
        process.exit();
    });


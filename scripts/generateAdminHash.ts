import bcrypt from 'bcrypt';
import { prisma } from '../src/prismaClient.js'; // ajusta la ruta

async function main() {
    const password = 'MiPasswordAdmin123';
    const hash = await bcrypt.hash(password, 10);

    const admin = await prisma.usuario.create({
        data: {
            email: 'admin@miapp.com',
            password: hash,
            role: 'ADMIN',
        }
    });

    console.log('Usuario admin creado:', admin);
}

main()
    .catch(e => console.error(e))
    .finally(() => process.exit());


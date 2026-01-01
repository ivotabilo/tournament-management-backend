import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// Forzar variable si no se cargó
process.env.DATABASE_URL ||= "postgresql://postgres:123@localhost:5433/torneo";

const prisma = new PrismaClient();

async function testConexion() {
  try {
    await prisma.$connect();
    console.log("✅ Conexión exitosa a la DB");
  } catch (err) {
    console.error("❌ Error conectando a la DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testConexion();


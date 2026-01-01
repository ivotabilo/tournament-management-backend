import { PrismaClient, Prisma } from "@prisma/client";

// Singleton para hot-reload en dev
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Export opcional si lo usás en servicios
export function getPrismaClient(): PrismaClient {
  return prisma;
}

// Export de tipos Prisma
export { Prisma };

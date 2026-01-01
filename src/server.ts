import express from "express";
import cors from "cors";
import path from "path";

import equipoRoutes from './routes/equipo.routes.js';
import authRoutes from './routes/auth.routes.js';

export function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Solo mantiene esta línea si todavía vas a usar archivos locales para otra cosa
  // app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use("/auth", authRoutes);
  app.use("/equipos", equipoRoutes);

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`));
}




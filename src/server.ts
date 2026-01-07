import express from "express";
import cors from "cors";
import path from "path";

import equipoRoutes from './routes/equipo.routes.js';
import authRoutes from './routes/auth.routes.js';

export function startServer() {
  const app = express();

  // Middlewares básicos
  app.use(cors());
  app.use(express.json());

  // --- SECCIÓN 5: ENDPOINT PARA EVITAR QUE RENDER SE DUERMA ---
  // Este endpoint responde cada 14 minutos para mantener el servidor activo
  app.get('/health', (_req, res) => {
    console.log('--- Cron-job detectado: Manteniendo la app despierta ---');
    res.status(200).send('OK');
  });
  // ------------------------------------------------------------

  // Rutas de la API
  app.use("/auth", authRoutes);
  app.use("/equipos", equipoRoutes);

  // Comentado según tu código original
  // app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
    console.log(`Endpoint de salud disponible en: /health`);
  });
}




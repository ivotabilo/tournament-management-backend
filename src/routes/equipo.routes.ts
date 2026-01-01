import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { crearEquipo, obtenerEquiposTabla } from "../controllers/equipo.controller.js";

const router = Router();

// 1. Configurar credenciales de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configurar el motor de almacenamiento de Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'logos-equipos', // Carpeta en Cloudinary
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage });

// 3. Definir rutas
router.get("/tabla", obtenerEquiposTabla);
router.post("/", upload.single('teamImage'), crearEquipo);

export default router;





import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { 
  crearEquipo, 
  obtenerEquiposTabla, 
  obtenerMiEquipo, 
  editarMiEquipo 
} from "../controllers/equipo.controller.js";
import { verificarToken } from '../middlewares/auth.middleware.js';

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
      folder: 'logos-equipos', 
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage });

// 3. Definir rutas

// --- RUTAS PÚBLICAS ---
// Para ver la tabla de posiciones general
router.get("/tabla", obtenerEquiposTabla);

// Para registrar un equipo nuevo (aquí no pedimos token porque es el registro)
router.post("/", upload.single('teamImage'), crearEquipo);

// --- RUTAS PRIVADAS (Requieren estar Logueado) ---


/**
 * GET /equipos/:id
 * Trae toda la info del equipo y su roster completo.
 * El middleware 'verificarToken' protege que no cualquier extraño vea estos datos.
 */
router.get("/:id", verificarToken, obtenerMiEquipo);

/**
 * PUT /equipos/:id
 * Permite editar Nombre, Tag, Logo y los 8 integrantes del equipo.
 * Usamos 'upload.single' por si el capitán decide subir un logo nuevo a Cloudinary.
 */
router.put("/:id", verificarToken, upload.single('teamImage'), editarMiEquipo);

export default router;





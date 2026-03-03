import express from 'express';
import { subirImagen, eliminarImagen } from '../controllers/uploadController.js';
import { protegerRuta, esAdminOEditor } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// Ruta para subir imagen (solo admin y editores)
router.post('/', protegerRuta, esAdminOEditor, upload.single('imagen'), subirImagen);

// Ruta para eliminar imagen (solo admin y editores)
router.delete('/:filename', protegerRuta, esAdminOEditor, eliminarImagen);

export default router;

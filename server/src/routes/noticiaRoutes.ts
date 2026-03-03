import express from 'express';
import {
  getNoticias,
  getNoticiaPorId,
  crearNoticia,
  actualizarNoticia,
  eliminarNoticia,
  getMisNoticias
} from '../controllers/noticiaController.js';
import { protegerRuta, esAdminOEditor, verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (con verificación opcional de token para mostrar borradores a autores)
router.get('/', verificarToken, getNoticias);
router.get('/:id', verificarToken, getNoticiaPorId);

// Rutas protegidas - requieren autenticación
router.get('/usuario/mis-noticias', protegerRuta, getMisNoticias);

// Rutas protegidas - requieren ser admin o editor
router.post('/', protegerRuta, esAdminOEditor, crearNoticia);

// Rutas protegidas - requieren ser propietario o admin
router.put('/:id', protegerRuta, actualizarNoticia);
router.delete('/:id', protegerRuta, eliminarNoticia);

export default router;
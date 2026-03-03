import express from 'express';
import {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  logoutUsuario,
  actualizarPerfil
} from '../controllers/authController.js';
import { protegerRuta } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

// Rutas protegidas
router.get('/perfil', protegerRuta, obtenerPerfil);
router.put('/perfil', protegerRuta, actualizarPerfil);
router.post('/logout', protegerRuta, logoutUsuario);

export default router;

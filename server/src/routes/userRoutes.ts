import { Router } from 'express';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarRolUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
  obtenerEstadisticasUsuarios
} from '../controllers/userController.js';
import { protegerRuta, esAdmin } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(protegerRuta, esAdmin);

// Rutas de gestión de usuarios
router.get('/stats', obtenerEstadisticasUsuarios);
router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.put('/:id/rol', actualizarRolUsuario);
router.put('/:id/estado', cambiarEstadoUsuario);
router.delete('/:id', eliminarUsuario);

export default router;

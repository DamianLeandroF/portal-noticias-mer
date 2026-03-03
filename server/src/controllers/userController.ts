import type { Response } from 'express';
import User, { UserRole } from '../models/User.js';
import type { AuthRequest } from '../middleware/auth.js';

// @desc    Obtener todos los usuarios (solo admin)
// @route   GET /api/users
// @access  Private/Admin
export const obtenerUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarios = await User.find({}).select('-password').sort({ fechaCreacion: -1 });
    
    res.json(usuarios);
  } catch (error: unknown) {
    console.error('Error en obtenerUsuarios:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuarios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// @desc    Obtener un usuario por ID (solo admin)
// @route   GET /api/users/:id
// @access  Private/Admin
export const obtenerUsuarioPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuario = await User.findById(req.params.id).select('-password');
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.json(usuario);
  } catch (error: unknown) {
    console.error('Error en obtenerUsuarioPorId:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// @desc    Actualizar rol de usuario (solo admin)
// @route   PUT /api/users/:id/rol
// @access  Private/Admin
export const actualizarRolUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rol } = req.body;
    
    // Validar que el rol sea válido
    if (!Object.values(UserRole).includes(rol)) {
      res.status(400).json({ message: 'Rol inválido' });
      return;
    }
    
    const usuario = await User.findById(req.params.id);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Evitar que el admin se quite sus propios permisos
    if (req.user && usuario._id.toString() === req.user._id.toString() && rol !== UserRole.ADMIN) {
      res.status(400).json({ message: 'No puedes cambiar tu propio rol de administrador' });
      return;
    }
    
    usuario.rol = rol;
    await usuario.save();
    
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo
    });
  } catch (error: unknown) {
    console.error('Error en actualizarRolUsuario:', error);
    res.status(500).json({ 
      message: 'Error al actualizar rol',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// @desc    Activar/Desactivar usuario (solo admin)
// @route   PUT /api/users/:id/estado
// @access  Private/Admin
export const cambiarEstadoUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { activo } = req.body;
    
    if (typeof activo !== 'boolean') {
      res.status(400).json({ message: 'El campo activo debe ser un booleano' });
      return;
    }
    
    const usuario = await User.findById(req.params.id);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Evitar que el admin se desactive a sí mismo
    if (req.user && usuario._id.toString() === req.user._id.toString() && !activo) {
      res.status(400).json({ message: 'No puedes desactivar tu propia cuenta' });
      return;
    }
    
    usuario.activo = activo;
    await usuario.save();
    
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo
    });
  } catch (error: unknown) {
    console.error('Error en cambiarEstadoUsuario:', error);
    res.status(500).json({ 
      message: 'Error al cambiar estado del usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// @desc    Eliminar usuario (solo admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const eliminarUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuario = await User.findById(req.params.id);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Evitar que el admin se elimine a sí mismo
    if (req.user && usuario._id.toString() === req.user._id.toString()) {
      res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
      return;
    }
    
    await usuario.deleteOne();
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error: unknown) {
    console.error('Error en eliminarUsuario:', error);
    res.status(500).json({ 
      message: 'Error al eliminar usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// @desc    Obtener estadísticas de usuarios (solo admin)
// @route   GET /api/users/stats
// @access  Private/Admin
export const obtenerEstadisticasUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsuarios = await User.countDocuments();
    const usuariosActivos = await User.countDocuments({ activo: true });
    const usuariosInactivos = await User.countDocuments({ activo: false });
    
    const usuariosPorRol = await User.aggregate([
      {
        $group: {
          _id: '$rol',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      total: totalUsuarios,
      activos: usuariosActivos,
      inactivos: usuariosInactivos,
      porRol: usuariosPorRol
    });
  } catch (error: unknown) {
    console.error('Error en obtenerEstadisticasUsuarios:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

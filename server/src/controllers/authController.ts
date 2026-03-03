import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User.js';
import type { AuthRequest } from '../middleware/auth.js';

// Generar JWT
const generarToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/registro
// @access  Public
export const registrarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password } = req.body;

    // Validar campos
    if (!nombre || !email || !password) {
      res.status(400).json({ message: 'Por favor completa todos los campos' });
      return;
    }

    // Verificar si el usuario ya existe
    const usuarioExiste = await User.findOne({ email });
    if (usuarioExiste) {
      res.status(400).json({ message: 'El email ya está registrado' });
      return;
    }

    // Crear usuario
    const usuario = await User.create({
      nombre,
      email,
      password,
      rol: UserRole.USER // Por defecto es usuario normal
    });

    if (usuario) {
      res.status(201).json({
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        token: generarToken(usuario._id.toString())
      });
    }
  } catch (error: unknown) {
    console.error('Error en registrarUsuario:', error);
    res.status(500).json({ 
      message: 'Error al registrar usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
export const loginUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      res.status(400).json({ message: 'Por favor completa todos los campos' });
      return;
    }

    // Buscar usuario y incluir password
    const usuario = await User.findOne({ email }).select('+password');

    if (!usuario) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // Verificar si está activo
    if (!usuario.activo) {
      res.status(401).json({ message: 'Usuario inactivo. Contacta al administrador' });
      return;
    }

    // Verificar password
    const passwordCorrecto = await usuario.compararPassword(password);

    if (!passwordCorrecto) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    // Generar token
    const token = generarToken(usuario._id.toString());

    // Enviar cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
    });

    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      avatar: usuario.avatar,
      token
    });
  } catch (error: unknown) {
    console.error('Error en loginUsuario:', error);
    res.status(500).json({ 
      message: 'Error al iniciar sesión',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/perfil
// @access  Private
export const obtenerPerfil = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    res.json({
      _id: req.user._id,
      nombre: req.user.nombre,
      email: req.user.email,
      rol: req.user.rol,
      avatar: req.user.avatar,
      fechaCreacion: req.user.fechaCreacion,
      ultimoAcceso: req.user.ultimoAcceso
    });
  } catch (error: unknown) {
    console.error('Error en obtenerPerfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

// @desc    Logout de usuario
// @route   POST /api/auth/logout
// @access  Private
export const logoutUsuario = async (req: Request, res: Response): Promise<void> => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({ message: 'Sesión cerrada exitosamente' });
};

// @desc    Actualizar perfil
// @route   PUT /api/auth/perfil
// @access  Private
export const actualizarPerfil = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const usuario = await User.findById(req.user._id);

    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Actualizar campos permitidos
    usuario.nombre = req.body.nombre || usuario.nombre;
    usuario.avatar = req.body.avatar || usuario.avatar;

    // Si se proporciona nueva contraseña
    if (req.body.password) {
      usuario.password = req.body.password;
    }

    const usuarioActualizado = await usuario.save();

    res.json({
      _id: usuarioActualizado._id,
      nombre: usuarioActualizado.nombre,
      email: usuarioActualizado.email,
      rol: usuarioActualizado.rol,
      avatar: usuarioActualizado.avatar
    });
  } catch (error: unknown) {
    console.error('Error en actualizarPerfil:', error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

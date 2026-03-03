import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { type IUser, UserRole } from '../models/User.js';

// Extender Request para incluir usuario
export interface AuthRequest extends Request {
  user?: IUser;
}

// Middleware para verificar token JWT (opcional)
export const verificarToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header o cookies
    let token = req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.token;

    if (token) {
      try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };

        // Obtener usuario del token
        const user = await User.findById(decoded.id).select('-password');

        if (user && user.activo) {
          req.user = user;
        }
      } catch (error) {
        // Token inválido, continuar sin usuario
        console.log('Token inválido:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Error en verificarToken:', error);
    next();
  }
};

// Middleware para verificar token JWT (requerido)
export const protegerRuta = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header o cookies
    let token = req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.token;

    if (!token) {
      res.status(401).json({ 
        message: 'No autorizado. Token no proporcionado' 
      });
      return;
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };

    // Obtener usuario del token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ 
        message: 'Usuario no encontrado' 
      });
      return;
    }

    if (!user.activo) {
      res.status(401).json({ 
        message: 'Usuario inactivo' 
      });
      return;
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en protegerRuta:', error);
    res.status(401).json({ 
      message: 'Token inválido o expirado' 
    });
  }
};

// Middleware para verificar roles específicos
export const verificarRol = (...rolesPermitidos: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        message: 'No autorizado' 
      });
      return;
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({ 
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}` 
      });
      return;
    }

    next();
  };
};

// Middleware para verificar si es admin
export const esAdmin = verificarRol(UserRole.ADMIN);

// Middleware para verificar si es admin o editor
export const esAdminOEditor = verificarRol(UserRole.ADMIN, UserRole.EDITOR);

// Middleware para verificar si es el propietario del recurso o admin
export const esPropietarioOAdmin = (obtenerAutorId: (req: AuthRequest) => string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }

      // Admin puede hacer todo
      if (req.user.rol === UserRole.ADMIN) {
        next();
        return;
      }

      // Verificar si es el propietario
      const autorId = obtenerAutorId(req);
      if (req.user._id.toString() === autorId) {
        next();
        return;
      }

      res.status(403).json({ 
        message: 'No tienes permiso para realizar esta acción' 
      });
    } catch (error) {
      console.error('Error en esPropietarioOAdmin:', error);
      res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
};

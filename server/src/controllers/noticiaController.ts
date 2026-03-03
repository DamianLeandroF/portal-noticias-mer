import type { Response } from 'express';
import Noticia from '../models/Noticia.js';
import { UserRole } from '../models/User.js';
import type { AuthRequest } from '../middleware/auth.js';

// @desc    Obtener todas las noticias publicadas
// @route   GET /api/noticias
// @access  Public
export const getNoticias = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoria, autor } = req.query;
    
    // Filtro base: solo noticias publicadas para usuarios no autenticados
    const filtro: Record<string, unknown> = {};
    
    // Si el usuario es admin o editor, puede ver todas las noticias
    if (req.user && [UserRole.ADMIN, UserRole.EDITOR].includes(req.user.rol)) {
      // No filtrar por publicada
    } else {
      filtro.publicada = true;
    }

    if (categoria) {
      filtro.categoria = categoria;
    }

    if (autor) {
      filtro.autor = autor;
    }

    const noticias = await Noticia.find(filtro)
      .populate('autor', 'nombre email avatar')
      .sort({ fechaCreacion: -1 });

    res.status(200).json(noticias);
  } catch (error) {
    console.error('Error en getNoticias:', error);
    res.status(500).json({ message: 'Error al obtener las noticias', error });
  }
};

// @desc    Obtener una noticia por ID
// @route   GET /api/noticias/:id
// @access  Public
export const getNoticiaPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const noticia = await Noticia.findById(req.params.id)
      .populate('autor', 'nombre email avatar');

    if (!noticia) {
      res.status(404).json({ message: 'Noticia no encontrada' });
      return;
    }

    // Si no está publicada, solo admin, editor o autor pueden verla
    if (!noticia.publicada) {
      if (!req.user) {
        res.status(403).json({ message: 'Esta noticia no está publicada' });
        return;
      }

      const esAutor = noticia.autor._id.toString() === req.user._id.toString();
      const esAdminOEditor = [UserRole.ADMIN, UserRole.EDITOR].includes(req.user.rol);

      if (!esAutor && !esAdminOEditor) {
        res.status(403).json({ message: 'No tienes permiso para ver esta noticia' });
        return;
      }
    }

    res.status(200).json(noticia);
  } catch (error) {
    console.error('Error en getNoticiaPorId:', error);
    res.status(500).json({ message: 'Error al obtener la noticia', error });
  }
};

// @desc    Crear una nueva noticia
// @route   POST /api/noticias
// @access  Private (Admin, Editor)
export const crearNoticia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const { titulo, subtitulo, cuerpo, categoria, imagenUrl, publicada } = req.body;

    // Validar campos requeridos
    if (!titulo || !cuerpo || !categoria) {
      res.status(400).json({ message: 'Título, cuerpo y categoría son requeridos' });
      return;
    }

    const nuevaNoticia = await Noticia.create({
      titulo,
      subtitulo,
      cuerpo,
      autor: req.user._id,
      categoria,
      imagenUrl,
      publicada: publicada || false
    });

    const noticiaPopulada = await Noticia.findById(nuevaNoticia._id)
      .populate('autor', 'nombre email avatar');

    res.status(201).json(noticiaPopulada);
  } catch (error) {
    console.error('Error en crearNoticia:', error);
    res.status(400).json({ message: 'Error al crear la noticia', error });
  }
};

// @desc    Actualizar una noticia
// @route   PUT /api/noticias/:id
// @access  Private (Admin o autor de la noticia)
export const actualizarNoticia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const noticia = await Noticia.findById(req.params.id);

    if (!noticia) {
      res.status(404).json({ message: 'Noticia no encontrada' });
      return;
    }

    // Verificar permisos: admin o autor
    const esAutor = noticia.autor.toString() === req.user._id.toString();
    const esAdmin = req.user.rol === UserRole.ADMIN;

    if (!esAutor && !esAdmin) {
      res.status(403).json({ message: 'No tienes permiso para editar esta noticia' });
      return;
    }

    // Actualizar campos
    const { titulo, subtitulo, cuerpo, categoria, imagenUrl, publicada } = req.body;

    noticia.titulo = titulo || noticia.titulo;
    noticia.subtitulo = subtitulo !== undefined ? subtitulo : noticia.subtitulo;
    noticia.cuerpo = cuerpo || noticia.cuerpo;
    noticia.categoria = categoria || noticia.categoria;
    noticia.imagenUrl = imagenUrl !== undefined ? imagenUrl : noticia.imagenUrl;
    
    // Solo admin puede cambiar estado de publicación si no es el autor
    if (publicada !== undefined) {
      if (esAdmin || esAutor) {
        noticia.publicada = publicada;
      }
    }

    noticia.fechaActualizacion = new Date();

    const noticiaActualizada = await noticia.save();
    const noticiaPopulada = await Noticia.findById(noticiaActualizada._id)
      .populate('autor', 'nombre email avatar');

    res.status(200).json(noticiaPopulada);
  } catch (error) {
    console.error('Error en actualizarNoticia:', error);
    res.status(400).json({ message: 'Error al actualizar la noticia', error });
  }
};

// @desc    Eliminar una noticia
// @route   DELETE /api/noticias/:id
// @access  Private (Admin o autor de la noticia)
export const eliminarNoticia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const noticia = await Noticia.findById(req.params.id);

    if (!noticia) {
      res.status(404).json({ message: 'Noticia no encontrada' });
      return;
    }

    // Verificar permisos: admin o autor
    const esAutor = noticia.autor.toString() === req.user._id.toString();
    const esAdmin = req.user.rol === UserRole.ADMIN;

    if (!esAutor && !esAdmin) {
      res.status(403).json({ message: 'No tienes permiso para eliminar esta noticia' });
      return;
    }

    await noticia.deleteOne();

    res.status(200).json({ message: 'Noticia eliminada exitosamente' });
  } catch (error) {
    console.error('Error en eliminarNoticia:', error);
    res.status(500).json({ message: 'Error al eliminar la noticia', error });
  }
};

// @desc    Obtener mis noticias (del usuario autenticado)
// @route   GET /api/noticias/mis-noticias
// @access  Private
export const getMisNoticias = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const noticias = await Noticia.find({ autor: req.user._id })
      .populate('autor', 'nombre email avatar')
      .sort({ fechaCreacion: -1 });

    res.status(200).json(noticias);
  } catch (error) {
    console.error('Error en getMisNoticias:', error);
    res.status(500).json({ message: 'Error al obtener tus noticias', error });
  }
};
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';

// @desc    Subir imagen
// @route   POST /api/upload
// @access  Private (Admin/Editor)
export const subirImagen = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se proporcionó ningún archivo' });
      return;
    }

    // Subir a Cloudinary
    // El path.resolve es necesario para asegurar la ruta absoluta del archivo temporal
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'portal-noticias',
      use_filename: true,
      unique_filename: true,
    });

    // Eliminar el archivo local temporal después de subir a Cloudinary
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      message: 'Imagen subida a Cloudinary exitosamente',
      imageUrl: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    // Intentar limpiar el archivo local si hubo error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error al subir la imagen al servicio de almacenamiento' });
  }
};

// @desc    Eliminar imagen
// @route   DELETE /api/upload/:public_id
// @access  Private (Admin/Editor)
export const eliminarImagen = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params; // Aquí 'filename' actuará ahora como el public_id
    
    if (!filename) {
      res.status(400).json({ message: 'ID de imagen inválido' });
      return;
    }

    // Determinar si es una URL o un public_id
    // Si viene de Cloudinary, el frontend debería pasar el public_id o manejaremos la eliminación por ID
    const result = await cloudinary.uploader.destroy(filename);

    if (result.result !== 'ok') {
      res.status(400).json({ message: 'No se pudo eliminar la imagen de Cloudinary', detail: result });
      return;
    }

    res.status(200).json({ message: 'Imagen eliminada exitosamente de Cloudinary' });
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    res.status(500).json({ message: 'Error al eliminar la imagen' });
  }
};

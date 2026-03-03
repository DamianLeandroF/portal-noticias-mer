import { Schema, model, Document, Types } from 'mongoose';

// 1. Definimos la Interface para TypeScript
export interface INoticia extends Document {
  titulo: string;
  subtitulo?: string;
  cuerpo: string;
  autor: Types.ObjectId; // Referencia al usuario
  autorNombre?: string; // Campo virtual para mostrar el nombre
  categoria: 'Internacionales' | 'Local' | 'Deportes' | 'Tecnología';
  imagenUrl?: string;
  publicada: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
}

// 2. Definimos el Schema para MongoDB
const noticiaSchema = new Schema<INoticia>({
  titulo: { 
    type: String, 
    required: [true, 'El título es requerido'],
    trim: true,
    minlength: [10, 'El título debe tener al menos 10 caracteres']
  },
  subtitulo: { 
    type: String,
    trim: true
  },
  cuerpo: { 
    type: String, 
    required: [true, 'El cuerpo es requerido'],
    minlength: [50, 'El cuerpo debe tener al menos 50 caracteres']
  },
  autor: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El autor es requerido']
  },
  categoria: { 
    type: String, 
    enum: ['Internacionales', 'Local', 'Deportes', 'Tecnología'],
    required: [true, 'La categoría es requerida']
  },
  imagenUrl: { type: String },
  publicada: {
    type: Boolean,
    default: false
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  },
  fechaActualizacion: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar performance
noticiaSchema.index({ categoria: 1, publicada: 1, fechaCreacion: -1 });
noticiaSchema.index({ autor: 1 });

export default model<INoticia>('Noticia', noticiaSchema);
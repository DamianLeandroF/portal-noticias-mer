import { Schema, model, type Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Tipos de roles
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
  GUEST = 'guest'
}

// Interface para TypeScript
export interface IUser extends Document {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  avatar?: string;
  activo: boolean;
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  // Métodos
  compararPassword(password: string): Promise<boolean>;
}

// Schema de MongoDB
const userSchema = new Schema<IUser>({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password en queries por defecto
  },
  rol: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  avatar: {
    type: String,
    default: undefined
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  ultimoAcceso: {
    type: Date
  }
});

// Middleware: Hashear password antes de guardar
userSchema.pre('save', async function() {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar passwords
userSchema.methods.compararPassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export default model<IUser>('User', userSchema);

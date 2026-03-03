import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI no está definido en las variables de entorno');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

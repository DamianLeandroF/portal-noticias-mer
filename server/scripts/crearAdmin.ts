import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // 1. Importar bcrypt
import User, { UserRole } from '../src/models/User.js';

dotenv.config();

const crearAdminInicial = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portal-noticias';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const adminExistente = await User.findOne({ rol: UserRole.ADMIN });
    
    if (adminExistente) {
      console.log('⚠️ Ya existe un usuario administrador:');
      console.log(`   Email: ${adminExistente.email}`);
      await mongoose.connection.close();
      return;
    }

    // 2. Encriptar la contraseña antes de crear el objeto
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@portalnoticias.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'adminadminadmin';

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(adminPassword, salt);

    const adminData = {
      nombre: 'Administrador',
      email: adminEmail,
      password: passwordHasheada, // Usar la versión encriptada
      rol: UserRole.ADMIN,
      activo: true
    };

    const admin = await User.create(adminData);

    console.log('\n✅ Usuario administrador creado exitosamente:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rol: ${admin.rol}`);
    console.log('\n⚠️ IMPORTANTE: Las credenciales fueron leídas desde .env.\n');

    await mongoose.connection.close();
    console.log('✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error al crear administrador:', error);
    process.exit(1);
  }
};

crearAdminInicial();
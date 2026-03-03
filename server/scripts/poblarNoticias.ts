import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const UserSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  rol: String,
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now }
});

const NoticiaSchema = new mongoose.Schema({
  titulo: String,
  subtitulo: String,
  cuerpo: String,
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  categoria: String,
  imagenUrl: String,
  publicada: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Noticia = mongoose.model('Noticia', NoticiaSchema);

async function poblarDatos() {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI no está definido');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones
    await User.deleteMany({});
    await Noticia.deleteMany({});
    console.log('🗑️  Datos anteriores eliminados');

    // Obtener credenciales de .env o usar defaults
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@portalmdq.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || '123456';

    // Hashear passwords
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);
    const hashedUserPassword = await bcrypt.hash('123456', salt);

    // Crear usuarios
    const admin = await User.create({
      nombre: 'Admin Portal',
      email: adminEmail,
      password: hashedAdminPassword,
      rol: 'admin'
    });

    const editor1 = await User.create({
      nombre: 'María González',
      email: 'maria@portalmdq.com',
      password: hashedUserPassword,
      rol: 'editor'
    });

    const editor2 = await User.create({
      nombre: 'Carlos Rodríguez',
      email: 'carlos@portalmdq.com',
      password: hashedUserPassword,
      rol: 'editor'
    });

    console.log('✅ Usuarios creados:');
    console.log(`   - ${adminEmail} (Admin)`);
    console.log('   - maria@portalmdq.com (Editor)');
    console.log('   - carlos@portalmdq.com (Editor)');

    // Crear noticias
    const noticias = [
      {
        titulo: "Mar del Plata se prepara para la temporada de verano 2026",
        subtitulo: "La ciudad espera recibir más de 2 millones de turistas",
        cuerpo: "Las autoridades municipales de Mar del Plata anunciaron que la ciudad está completamente preparada para recibir la temporada de verano 2026. Se han realizado importantes mejoras en la infraestructura turística.",
        autor: editor1._id,
        categoria: "Local",
        imagenUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        publicada: true
      },
      {
        titulo: "Cumbre del G20 aborda crisis climática global",
        subtitulo: "Líderes mundiales discuten medidas urgentes",
        cuerpo: "En una cumbre histórica del G20, los líderes de las principales economías del mundo se han comprometido a acelerar la transición hacia energías renovables.",
        autor: editor2._id,
        categoria: "Internacionales",
        imagenUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
        publicada: true
      },
      {
        titulo: "Aldosivi logra un triunfo histórico",
        subtitulo: "El 'Tiburón' venció 3-1 a Alvarado",
        cuerpo: "En un encuentro emocionante, Aldosivi se impuso por 3-1 ante Alvarado en el clásico marplatense. El estadio vibró con más de 20.000 espectadores.",
        autor: editor1._id,
        categoria: "Deportes",
        imagenUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
        publicada: true
      },
      {
        titulo: "IA revoluciona la medicina moderna",
        subtitulo: "Sistema detecta enfermedades con 99% de precisión",
        cuerpo: "Un equipo internacional ha desarrollado un sistema de IA capaz de detectar más de 50 enfermedades con una precisión del 99%.",
        autor: editor2._id,
        categoria: "Tecnología",
        imagenUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        publicada: true
      },
      {
        titulo: "Nuevo centro cultural en Los Pinares",
        subtitulo: "Talleres gratuitos para la comunidad",
        cuerpo: "La Municipalidad inauguró un moderno centro cultural en el barrio Los Pinares con salas de teatro, talleres de arte y biblioteca.",
        autor: editor1._id,
        categoria: "Local",
        imagenUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800",
        publicada: true
      },
      {
        titulo: "Borrador: Nueva ordenanza de tránsito",
        subtitulo: "Concejo analiza cambios viales",
        cuerpo: "El Concejo Deliberante analiza una nueva ordenanza de tránsito con cambios significativos. Esta noticia está en borrador.",
        autor: editor1._id,
        categoria: "Local",
        publicada: false
      }
    ];

    await Noticia.insertMany(noticias);
    console.log(`✅ ${noticias.length} noticias creadas (5 publicadas, 1 borrador)`);

    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

poblarDatos();

// Tipo para el autor poblado
export interface IAutor {
  _id: string;
  nombre: string;
  email: string;
  avatar?: string;
}

// Tipo para la noticia
export interface INoticia {
  _id: string;
  titulo: string;
  subtitulo?: string;
  cuerpo: string;
  autor: IAutor; // Ahora es un objeto poblado
  categoria: 'Internacionales' | 'Local' | 'Deportes' | 'Tecnología';
  imagenUrl?: string;
  publicada: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string;
}
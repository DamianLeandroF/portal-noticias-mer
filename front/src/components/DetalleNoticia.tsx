import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Tag,
} from "lucide-react";
import type { INoticia } from "../types/noticia";
import "./DetalleNoticia.css";

export const DetalleNoticia = () => {
  const { id } = useParams<{ id: string }>();
  const [noticia, setNoticia] = useState<INoticia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/api/noticias`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar la noticia");
        return res.json();
      })
      .then((data: INoticia[]) => {
        const noticiaEncontrada = data.find((n) => n._id === id);
        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
        } else {
          setError("Noticia no encontrada");
        }
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al traer noticia:", error);
        setError(error.message);
        setCargando(false);
      });
  }, [id]);

  const getCategoriaClass = (categoria: string) => {
    const categorias: Record<string, string> = {
      Internacionales: "internacional",
      Local: "local",
      Deportes: "deportes",
      Tecnología: "tecnologia",
    };
    return categorias[categoria] || "local";
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (cargando) {
    return (
      <div className="container-narrow">
        <div className="detalle-loading">
          <div className="spinner"></div>
          <p>Cargando noticia...</p>
        </div>
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="container-narrow">
        <div className="detalle-error">
          <div className="error-icon">⚠️</div>
          <h2>Error al cargar la noticia</h2>
          <p>{error || "Noticia no encontrada"}</p>
          <Link to="/" className="btn-volver">
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="detalle-noticia fade-in">
      <div className="container-narrow">
        <Link to="/" className="breadcrumb">
          <ArrowLeft size={18} />
          Volver a noticias
        </Link>

        <header className="detalle-header">
          <span
            className={`categoria-badge ${getCategoriaClass(noticia.categoria)}`}
          >
            {noticia.categoria}
          </span>

          <h1 className="detalle-titulo">{noticia.titulo}</h1>

          {noticia.subtitulo && (
            <h2 className="detalle-subtitulo">{noticia.subtitulo}</h2>
          )}

          <div className="detalle-meta">
            <div className="autor-info">
              <div className="autor-avatar">
                {noticia.autor.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="autor-nombre">{noticia.autor.nombre}</p>
                <p className="noticia-fecha">
                  {formatFecha(noticia.fechaCreacion)}
                </p>
              </div>
            </div>

            <div className="share-buttons">
              <button className="share-btn" title="Compartir en Facebook">
                <Facebook size={18} />
              </button>
              <button className="share-btn" title="Compartir en Twitter">
                <Twitter size={18} />
              </button>
              <button className="share-btn" title="Compartir en WhatsApp">
                <MessageCircle size={18} />
              </button>
              <button className="share-btn" title="Compartir">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </header>

        {noticia.imagenUrl && (
          <div className="detalle-imagen">
            <img src={noticia.imagenUrl} alt={noticia.titulo} />
          </div>
        )}

        <div className="detalle-contenido">
          {noticia.cuerpo.split("\n").map((parrafo, index) => (
            <p key={index}>{parrafo}</p>
          ))}
        </div>

        <footer className="detalle-footer">
          <div className="tags">
            <span className="tag">
              <Tag size={14} />
              {noticia.categoria}
            </span>
            <span className="tag">
              <Tag size={14} />
              {noticia.autor.nombre}
            </span>
          </div>

          <Link to="/" className="btn-volver-footer">
            <ArrowLeft size={20} />
            Volver a todas las noticias
          </Link>
        </footer>
      </div>
    </article>
  );
};

import { Link, useNavigate } from "react-router-dom";
import { Calendar, User, Edit, Trash2 } from "lucide-react";
import type { INoticia } from "../types/noticia";
import { useAuth } from "../context/AuthContext";
import "./NoticiaCard.css";

interface NoticiaCardProps {
  noticia: INoticia;
  featured?: boolean;
  onDelete?: (id: string) => void;
}

export const NoticiaCard = ({
  noticia,
  featured = false,
  onDelete,
}: NoticiaCardProps) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

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

  // Verificar si el usuario puede editar/eliminar
  const puedeEditar = user && (isAdmin || user._id === noticia.autor._id);

  const handleCardClick = () => {
    navigate(`/noticia/${noticia._id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Evitar que se active el click de la tarjeta
    action();
  };

  return (
    <article
      className={`noticia-card ${featured ? "featured" : ""} fade-in`}
      onClick={handleCardClick}
    >
      {noticia.imagenUrl && (
        <div className="noticia-image">
          <img src={noticia.imagenUrl} alt={noticia.titulo} />
          <span
            className={`categoria-badge ${getCategoriaClass(noticia.categoria)}`}
          >
            {noticia.categoria}
          </span>
          {!noticia.publicada && (
            <span className="borrador-badge">Borrador</span>
          )}
        </div>
      )}

      <div className="noticia-content">
        {!noticia.imagenUrl && (
          <>
            <span
              className={`categoria-badge ${getCategoriaClass(noticia.categoria)}`}
            >
              {noticia.categoria}
            </span>
            {!noticia.publicada && (
              <span className="borrador-badge">Borrador</span>
            )}
          </>
        )}

        <h2 className="noticia-titulo">{noticia.titulo}</h2>

        {noticia.subtitulo && (
          <h3 className="noticia-subtitulo">{noticia.subtitulo}</h3>
        )}

        <p className="noticia-cuerpo">
          {noticia.cuerpo.length > 200
            ? `${noticia.cuerpo.substring(0, 200)}...`
            : noticia.cuerpo}
        </p>

        <div className="noticia-footer">
          <div className="autor-info">
            <div className="autor-avatar">
              {noticia.autor.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="autor-details">
              <p className="autor-nombre">
                <User size={14} />
                {noticia.autor.nombre}
              </p>
              <p className="noticia-fecha">
                <Calendar size={14} />
                {formatFecha(noticia.fechaCreacion)}
              </p>
            </div>
          </div>

          {puedeEditar && (
            <div className="noticia-actions">
              <Link
                to={`/editar-noticia/${noticia._id}`}
                className="btn-action btn-edit"
                title="Editar noticia"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit size={18} />
              </Link>
              <button
                onClick={(e) =>
                  handleActionClick(e, () => onDelete && onDelete(noticia._id))
                }
                className="btn-action btn-delete"
                title="Eliminar noticia"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

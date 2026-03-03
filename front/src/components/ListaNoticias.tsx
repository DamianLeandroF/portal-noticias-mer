import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { AlertTriangle, Search, RefreshCw } from "lucide-react";
import type { INoticia } from "../types/noticia";
import { NoticiaCard } from "./NoticiaCard";
import { SkeletonCard } from "./LoadingSpinner";
import { Hero } from "./Hero";
import { CategoriaFilter } from "./CategoriaFilter";
import { SearchBar } from "./SearchBar";
import { Modal } from "./Modal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./ListaNoticias.css";

export const ListaNoticias = () => {
  const [noticias, setNoticias] = useState<INoticia[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [noticiaAEliminar, setNoticiaAEliminar] = useState<string | null>(null);

  const { token } = useAuth();
  const { success, error: showError } = useToast();

  const cargarNoticias = () => {
    setCargando(true);
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(`${API_URL}/api/noticias`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar las noticias");
        return res.json();
      })
      .then((data: INoticia[]) => {
        setNoticias(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al traer noticias:", error);
        setError(error.message);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarNoticias();
  }, [token]);

  const handleEliminar = async () => {
    if (!noticiaAEliminar || !token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/noticias/${noticiaAEliminar}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al eliminar la noticia");
      }

      success("Noticia eliminada exitosamente");
      cargarNoticias(); // Recargar lista
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Error al eliminar la noticia",
      );
    } finally {
      setNoticiaAEliminar(null);
    }
  };

  // Filtrar por categoría
  let noticiasFiltradas =
    categoriaActiva === "todas"
      ? noticias
      : noticias.filter((n) => n.categoria === categoriaActiva);

  // Filtrar por búsqueda
  if (searchQuery.trim()) {
    noticiasFiltradas = noticiasFiltradas.filter(
      (n) =>
        n.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.cuerpo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.subtitulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.autor.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  if (cargando) {
    return (
      <>
        <Hero />
        <div className="container">
          <div className="noticias-grid">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Hero />
        <div className="container">
          <div className="error-container">
            <div className="error-icon">
              <AlertTriangle size={64} strokeWidth={1.5} />
            </div>
            <h2>Error al cargar las noticias</h2>
            <p>{error}</p>
            <button
              className="btn-retry"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={20} />
              Reintentar
            </button>
          </div>
        </div>
      </>
    );
  }

  if (noticias.length === 0) {
    return (
      <>
        <Hero />
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h2>No hay noticias disponibles</h2>
            <p>Vuelve más tarde para ver las últimas novedades</p>
          </div>
        </div>
      </>
    );
  }

  const noticiaSeleccionada = noticias.find((n) => n._id === noticiaAEliminar);

  return (
    <>
      <Hero />

      <SearchBar onSearch={setSearchQuery} />

      <CategoriaFilter
        categoriaActiva={categoriaActiva}
        onCategoriaChange={setCategoriaActiva}
      />

      <div className="container">
        <div className="page-header">
          <h2 className="section-title">
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : categoriaActiva === "todas"
                ? "Todas las Noticias"
                : `Noticias de ${categoriaActiva}`}
          </h2>
          <p className="section-subtitle">
            {noticiasFiltradas.length}{" "}
            {noticiasFiltradas.length === 1
              ? "noticia encontrada"
              : "noticias encontradas"}
          </p>
        </div>

        {noticiasFiltradas.length > 0 ? (
          <div className="noticias-grid">
            {noticiasFiltradas.map((noticia, index) => (
              <NoticiaCard
                key={noticia._id}
                noticia={noticia}
                featured={
                  index === 0 && categoriaActiva === "todas" && !searchQuery
                }
                onDelete={setNoticiaAEliminar}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={64} strokeWidth={1.5} />
            </div>
            <h2>No se encontraron resultados</h2>
            <p>
              {searchQuery
                ? `No hay noticias que coincidan con "${searchQuery}"`
                : "No hay noticias en esta categoría"}
            </p>
            <button
              className="btn-retry"
              onClick={() => {
                setSearchQuery("");
                setCategoriaActiva("todas");
              }}
            >
              <RefreshCw size={20} />
              Ver todas las noticias
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!noticiaAEliminar}
        onClose={() => setNoticiaAEliminar(null)}
        onConfirm={handleEliminar}
        title="Eliminar Noticia"
        message={`¿Estás seguro de que deseas eliminar la noticia "${noticiaSeleccionada?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
};

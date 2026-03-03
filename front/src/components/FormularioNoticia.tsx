import { useState, useEffect, useRef } from "react";
import { API_URL } from "../config";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Image,
  FileText,
  Tag,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./FormularioNoticia.css";

export const FormularioNoticia = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isEditor } = useAuth();
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [categoria, setCategoria] = useState<string>("Local");
  const [imagenUrl, setImagenUrl] = useState("");
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>("");
  const [publicada, setPublicada] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [error, setError] = useState("");

  const categorias = ["Local", "Internacionales", "Deportes", "Tecnología"];

  // Verificar permisos
  useEffect(() => {
    if (!isEditor) {
      navigate("/login");
    }
  }, [isEditor, navigate]);

  // Cargar noticia si estamos editando
  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/api/noticias/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setTitulo(data.titulo);
          setSubtitulo(data.subtitulo || "");
          setCuerpo(data.cuerpo);
          setCategoria(data.categoria);
          setImagenUrl(data.imagenUrl || "");
          setImagenPreview(data.imagenUrl || "");
          setPublicada(data.publicada);
        })
        .catch((err) => {
          console.error("Error al cargar noticia:", err);
          setError("Error al cargar la noticia");
        });
    }
  }, [id, token]);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten archivos de imagen");
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      setImagenFile(file);
      setImagenUrl(""); // Limpiar URL si había una

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagenFile(null);
    setImagenUrl("");
    setImagenPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const subirImagenAlServidor = async (): Promise<string | null> => {
    if (!imagenFile) return imagenUrl || null;

    setSubiendoImagen(true);
    try {
      const formData = new FormData();
      formData.append("imagen", imagenFile);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al subir la imagen");
      }

      return data.imageUrl;
    } catch (err) {
      console.error("Error al subir imagen:", err);
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
      return null;
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      // Subir imagen si hay una nueva
      let finalImageUrl = imagenUrl;
      if (imagenFile) {
        const uploadedUrl = await subirImagenAlServidor();
        if (!uploadedUrl) {
          setCargando(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      const noticiaData = {
        titulo,
        subtitulo: subtitulo || undefined,
        cuerpo,
        categoria,
        imagenUrl: finalImageUrl || undefined,
        publicada,
      };

      const url = id
        ? `${API_URL}/api/noticias/${id}`
        : `${API_URL}/api/noticias`;

      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noticiaData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar la noticia");
      }

      // Mostrar notificación de éxito
      if (id) {
        success("Noticia actualizada exitosamente");
      } else {
        success("Noticia creada exitosamente");
      }

      navigate("/");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al guardar la noticia";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setCargando(false);
    }
  };

  if (!isEditor) {
    return null;
  }

  return (
    <div className="formulario-container">
      <div className="formulario-card">
        <div className="formulario-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1>{id ? "Editar Noticia" : "Crear Nueva Noticia"}</h1>
          <p>
            Completa los campos para {id ? "actualizar" : "publicar"} la noticia
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="formulario-noticia">
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="titulo">
                <FileText size={18} />
                Título *
              </label>
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título de la noticia"
                required
                minLength={10}
                disabled={cargando}
              />
              <small className="form-hint">Mínimo 10 caracteres</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="subtitulo">
                <FileText size={18} />
                Subtítulo (opcional)
              </label>
              <input
                type="text"
                id="subtitulo"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                placeholder="Subtítulo o bajada"
                disabled={cargando}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoria">
                <Tag size={18} />
                Categoría *
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
                disabled={cargando}
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="imagenUrl">
                <Image size={18} />
                URL de Imagen (opcional)
              </label>
              <input
                type="url"
                id="imagenUrl"
                value={imagenUrl}
                onChange={(e) => {
                  setImagenUrl(e.target.value);
                  setImagenPreview(e.target.value);
                  setImagenFile(null);
                }}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={cargando || !!imagenFile}
              />
            </div>
          </div>

          {/* Subida de imagen */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>
                <Upload size={18} />
                Subir Imagen (opcional)
              </label>
              <div className="upload-container">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  disabled={cargando || !!imagenUrl}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-label">
                  <Upload size={20} />
                  {imagenFile ? imagenFile.name : "Seleccionar imagen"}
                </label>
                <small className="form-hint">
                  Formatos: JPG, PNG, GIF, WEBP. Máximo 5MB
                </small>
              </div>
            </div>
          </div>

          {/* Preview de imagen */}
          {imagenPreview && (
            <div className="form-row">
              <div className="form-group full-width">
                <label>Vista Previa</label>
                <div className="image-preview">
                  <img src={imagenPreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn-remove-image"
                    disabled={cargando}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="cuerpo">
                <FileText size={18} />
                Contenido *
              </label>
              <textarea
                id="cuerpo"
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                placeholder="Escribe el contenido de la noticia..."
                required
                minLength={50}
                rows={12}
                disabled={cargando}
              />
              <small className="form-hint">
                Mínimo 50 caracteres ({cuerpo.length} / 50)
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={publicada}
                  onChange={(e) => setPublicada(e.target.checked)}
                  disabled={cargando}
                />
                <span>Publicar inmediatamente</span>
              </label>
              <small className="form-hint">
                Si no está marcado, se guardará como borrador
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-cancel"
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={cargando || subiendoImagen}
            >
              <Save size={20} />
              {cargando
                ? subiendoImagen
                  ? "Subiendo imagen..."
                  : "Guardando..."
                : id
                  ? "Actualizar Noticia"
                  : "Crear Noticia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

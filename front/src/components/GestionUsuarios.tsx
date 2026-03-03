import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import "./GestionUsuarios.css";

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: "admin" | "editor" | "user" | "guest";
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

interface Estadisticas {
  total: number;
  activos: number;
  inactivos: number;
  porRol: Array<{ _id: string; count: number }>;
}

interface SimpleModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const SimpleModal = ({ children, onClose }: SimpleModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-simple"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const GestionUsuarios = () => {
  const { user, token } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);
  const [accionModal, setAccionModal] = useState<"rol" | "estado" | "eliminar">(
    "rol",
  );
  const [nuevoRol, setNuevoRol] = useState<string>("");

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Cargar usuarios
      const resUsuarios = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resUsuarios.ok) {
        throw new Error("Error al cargar usuarios");
      }

      const dataUsuarios = await resUsuarios.json();
      setUsuarios(dataUsuarios);

      // Cargar estadísticas
      const resEstadisticas = await fetch(`${API_URL}/api/users/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (resEstadisticas.ok) {
        const dataEstadisticas = await resEstadisticas.json();
        setEstadisticas(dataEstadisticas);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.rol === "admin") {
      cargarDatos();
    }
  }, [user, cargarDatos]);

  const abrirModalRol = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setNuevoRol(usuario.rol);
    setAccionModal("rol");
    setModalAbierto(true);
  };

  const abrirModalEstado = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setAccionModal("estado");
    setModalAbierto(true);
  };

  const abrirModalEliminar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setAccionModal("eliminar");
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setNuevoRol("");
  };

  const confirmarAccion = async () => {
    if (!usuarioSeleccionado) return;

    try {
      let url = "";
      let method = "PUT";
      let body = {};

      switch (accionModal) {
        case "rol":
          url = `${API_URL}/api/users/${usuarioSeleccionado._id}/rol`;
          body = { rol: nuevoRol };
          break;
        case "estado":
          url = `${API_URL}/api/users/${usuarioSeleccionado._id}/estado`;
          body = { activo: !usuarioSeleccionado.activo };
          break;
        case "eliminar":
          url = `${API_URL}/api/users/${usuarioSeleccionado._id}`;
          method = "DELETE";
          break;
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: method !== "DELETE" ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al realizar la acción");
      }

      // Recargar datos
      await cargarDatos();
      cerrarModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al realizar la acción",
      );
    }
  };

  const obtenerNombreRol = (rol: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      editor: "Editor",
      user: "Usuario",
      guest: "Invitado",
    };
    return roles[rol] || rol;
  };

  const obtenerColorRol = (rol: string) => {
    const colores: Record<string, string> = {
      admin: "rol-admin",
      editor: "rol-editor",
      user: "rol-user",
      guest: "rol-guest",
    };
    return colores[rol] || "";
  };

  if (user?.rol !== "admin") {
    return (
      <div className="gestion-usuarios-container">
        <div className="acceso-denegado">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="gestion-usuarios-container">
      <div className="gestion-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios y sus roles en el sistema</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {estadisticas && (
        <div className="estadisticas-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{estadisticas.total}</h3>
              <p>Total Usuarios</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{estadisticas.activos}</h3>
              <p>Usuarios Activos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>{estadisticas.inactivos}</h3>
              <p>Usuarios Inactivos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👑</div>
            <div className="stat-info">
              <h3>
                {estadisticas.porRol.find((r) => r._id === "admin")?.count || 0}
              </h3>
              <p>Administradores</p>
            </div>
          </div>
        </div>
      )}

      <div className="usuarios-tabla-container">
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario._id}>
                <td>
                  <div className="usuario-info">
                    <div className="usuario-avatar">
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span>{usuario.nombre}</span>
                  </div>
                </td>
                <td>{usuario.email}</td>
                <td>
                  <span className={`rol-badge ${obtenerColorRol(usuario.rol)}`}>
                    {obtenerNombreRol(usuario.rol)}
                  </span>
                </td>
                <td>
                  <span
                    className={`estado-badge ${usuario.activo ? "activo" : "inactivo"}`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>{new Date(usuario.fechaCreacion).toLocaleDateString()}</td>
                <td>
                  {usuario.ultimoAcceso
                    ? new Date(usuario.ultimoAcceso).toLocaleDateString()
                    : "Nunca"}
                </td>
                <td>
                  <div className="acciones-buttons">
                    <button
                      className="btn-accion btn-rol"
                      onClick={() => abrirModalRol(usuario)}
                      title="Cambiar rol"
                      disabled={usuario._id === user?._id}
                    >
                      🔄
                    </button>
                    <button
                      className="btn-accion btn-estado"
                      onClick={() => abrirModalEstado(usuario)}
                      title={usuario.activo ? "Desactivar" : "Activar"}
                      disabled={usuario._id === user?._id}
                    >
                      {usuario.activo ? "🔒" : "🔓"}
                    </button>
                    <button
                      className="btn-accion btn-eliminar"
                      onClick={() => abrirModalEliminar(usuario)}
                      title="Eliminar usuario"
                      disabled={usuario._id === user?._id}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && usuarioSeleccionado && (
        <SimpleModal onClose={cerrarModal}>
          <div className="modal-gestion">
            {accionModal === "rol" && (
              <>
                <h2>Cambiar Rol de Usuario</h2>
                <p>
                  Usuario: <strong>{usuarioSeleccionado.nombre}</strong>
                </p>
                <div className="form-group">
                  <label htmlFor="rol">Nuevo Rol:</label>
                  <select
                    id="rol"
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                  >
                    <option value="guest">Invitado</option>
                    <option value="user">Usuario</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button className="btn-cancelar" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button className="btn-confirmar" onClick={confirmarAccion}>
                    Confirmar
                  </button>
                </div>
              </>
            )}

            {accionModal === "estado" && (
              <>
                <h2>
                  {usuarioSeleccionado.activo ? "Desactivar" : "Activar"}{" "}
                  Usuario
                </h2>
                <p>
                  ¿Estás seguro de que deseas{" "}
                  {usuarioSeleccionado.activo ? "desactivar" : "activar"} a{" "}
                  <strong>{usuarioSeleccionado.nombre}</strong>?
                </p>
                <div className="modal-actions">
                  <button className="btn-cancelar" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button className="btn-confirmar" onClick={confirmarAccion}>
                    Confirmar
                  </button>
                </div>
              </>
            )}

            {accionModal === "eliminar" && (
              <>
                <h2>Eliminar Usuario</h2>
                <p>
                  ¿Estás seguro de que deseas eliminar a{" "}
                  <strong>{usuarioSeleccionado.nombre}</strong>?
                </p>
                <p className="warning-text">
                  Esta acción no se puede deshacer.
                </p>
                <div className="modal-actions">
                  <button className="btn-cancelar" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button
                    className="btn-confirmar btn-peligro"
                    onClick={confirmarAccion}
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </SimpleModal>
      )}
    </div>
  );
};

export default GestionUsuarios;

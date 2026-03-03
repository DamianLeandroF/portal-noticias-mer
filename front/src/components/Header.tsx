import { Link } from "react-router-dom";
import {
  Newspaper,
  LogIn,
  LogOut,
  User,
  PlusCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Header = () => {
  const { user, logout, isAuthenticated, isEditor } = useAuth();
  const isAdmin = user?.rol === "admin";

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Newspaper size={28} strokeWidth={2.5} />
            </div>
            <span>Portal MDQ</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link active">
              Inicio
            </Link>

            {isAuthenticated ? (
              <>
                {isEditor && (
                  <Link to="/crear-noticia" className="btn-crear-noticia">
                    <PlusCircle size={18} />
                    Crear Noticia
                  </Link>
                )}

                {isAdmin && (
                  <Link to="/admin/usuarios" className="btn-admin">
                    <Users size={18} />
                    Gestión Usuarios
                  </Link>
                )}

                <div className="user-info">
                  <User size={18} />
                  <span>{user?.nombre}</span>
                  <span className="user-badge">{user?.rol}</span>
                </div>

                <button onClick={logout} className="nav-link btn-logout">
                  <LogOut size={18} />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link btn-login">
                <LogIn size={18} />
                Iniciar Sesión
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

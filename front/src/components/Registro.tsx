import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await registro(nombre, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <UserPlus size={32} strokeWidth={2} />
          </div>
          <h1>Crear Cuenta</h1>
          <p>Regístrate en Portal MDQ</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nombre">
              <User size={18} />
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              required
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={cargando}
            />
            <small className="form-hint">Mínimo 6 caracteres</small>
          </div>

          <button type="submit" className="btn-submit" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

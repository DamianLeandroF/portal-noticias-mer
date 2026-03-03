import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <LogIn size={32} strokeWidth={2} />
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta de Portal MDQ</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
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
              disabled={cargando}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={cargando}>
            {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="link">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

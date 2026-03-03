import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ToastProvider } from "./context/ToastProvider";
import "./App.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ListaNoticias } from "./components/ListaNoticias";
import { DetalleNoticia } from "./components/DetalleNoticia";
import { Login } from "./components/Login";
import { Registro } from "./components/Registro";
import { FormularioNoticia } from "./components/FormularioNoticia";
import GestionUsuarios from "./components/GestionUsuarios";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<ListaNoticias />} />
                <Route path="/noticia/:id" element={<DetalleNoticia />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/crear-noticia" element={<FormularioNoticia />} />
                <Route
                  path="/editar-noticia/:id"
                  element={<FormularioNoticia />}
                />
                <Route path="/admin/usuarios" element={<GestionUsuarios />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

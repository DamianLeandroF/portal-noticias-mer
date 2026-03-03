import { Newspaper, Building2, Globe2, Trophy, Cpu } from "lucide-react";
import "./CategoriaFilter.css";

interface CategoriaFilterProps {
  categoriaActiva: string;
  onCategoriaChange: (categoria: string) => void;
}

const categorias = [
  { id: "todas", nombre: "Todas", Icono: Newspaper },
  { id: "Local", nombre: "Local", Icono: Building2 },
  { id: "Internacionales", nombre: "Internacional", Icono: Globe2 },
  { id: "Deportes", nombre: "Deportes", Icono: Trophy },
  { id: "Tecnología", nombre: "Tecnología", Icono: Cpu },
];

export const CategoriaFilter = ({
  categoriaActiva,
  onCategoriaChange,
}: CategoriaFilterProps) => {
  return (
    <div className="categoria-filter">
      <div className="container">
        <h3 className="filter-title">Filtrar por categoría</h3>
        <div className="filter-buttons">
          {categorias.map((cat) => {
            const IconComponent = cat.Icono;
            return (
              <button
                key={cat.id}
                className={`filter-btn ${categoriaActiva === cat.id ? "active" : ""}`}
                onClick={() => onCategoriaChange(cat.id)}
              >
                <IconComponent size={20} strokeWidth={2} />
                <span className="filter-name">{cat.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

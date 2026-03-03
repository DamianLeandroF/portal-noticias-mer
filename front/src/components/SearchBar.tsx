import { useState } from "react";
import { Search, X } from "lucide-react";
import "./SearchBar.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="search-bar-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" strokeWidth={2} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar noticias por título o contenido..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
            >
              <X size={20} strokeWidth={2} />
            </button>
          )}
        </div>
        <button type="submit" className="search-btn">
          Buscar
        </button>
      </form>
    </div>
  );
};

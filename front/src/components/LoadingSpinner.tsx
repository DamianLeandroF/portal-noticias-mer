import "./LoadingSpinner.css";

export const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Cargando noticias...</p>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-badge"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-subtitle"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-footer">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );
};

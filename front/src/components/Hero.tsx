import "./Hero.css";

export const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Portal de Noticias
            <span className="hero-highlight"> Mar del Plata</span>
          </h1>
          <p className="hero-description">
            Tu fuente confiable de información local e internacional. Mantente
            al día con las últimas noticias, deportes, tecnología y más.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Noticias Publicadas</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Actualización Continua</div>
            </div>
            <div className="stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Lectores Mensuales</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

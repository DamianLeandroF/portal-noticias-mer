export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Portal MDQ</h3>
            <p>Tu fuente confiable de noticias de Mar del Plata y el mundo.</p>
          </div>

          <div className="footer-section">
            <h3>Categorías</h3>
            <ul className="footer-links">
              <li>
                <a href="/categoria/local">Noticias Locales</a>
              </li>
              <li>
                <a href="/categoria/internacionales">Internacional</a>
              </li>
              <li>
                <a href="/categoria/deportes">Deportes</a>
              </li>
              <li>
                <a href="/categoria/tecnologia">Tecnología</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contacto</h3>
            <ul className="footer-links">
              <li>
                <a href="mailto:contacto@portalmdq.com">
                  contacto@portalmdq.com
                </a>
              </li>
              <li>
                <a href="tel:+542234567890">+54 223 456-7890</a>
              </li>
              <li>Mar del Plata, Buenos Aires</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Portal MDQ. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

import React from "react";
import "./AppLayout.css";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">Réservation de Salles</h1>
          <nav className="app-nav">
            <a href="/" className="nav-link">
              Accueil
            </a>
            <a href="/my-reservations" className="nav-link">
              Mes réservations
            </a>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <div className="app-container">{children}</div>
      </main>
      <footer className="app-footer">
        <p>&copy; 2026 Réservation de Salles. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

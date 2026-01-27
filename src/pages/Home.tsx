import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Assuming a CSS file for consistent styling

export function Home() {
  return (
    <div className="construction-page">
      <header className="construction-header">
        <h1 className="construction-title">Aequi</h1>
      </header>
      <main className="construction-main">
        <h2 className="construction-subtitle">Estamos Construindo Algo Incrível!</h2>
        <p className="construction-text">
          Nossa equipe está trabalhando duro para trazer novidades incríveis para você. Fique atento!
        </p>
        <div className="construction-actions">
          <Link to="/login" className="construction-login-button">
            Entrar
          </Link>
        </div>
      </main>
      <footer className="construction-footer">
        <p className="construction-footer-text">&copy; 2026 Aequi. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

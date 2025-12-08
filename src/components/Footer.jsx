import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <span style={styles.text}>
        Hermanos Vega © {currentYear}
      </span>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'transparent',
    border: 'none',
    padding: '12px 18px',
    width: '100%',
    textAlign: 'center',
    flexShrink: 0,
  },
  text: {
    color: '#bfc0d1',
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.3px',
    opacity: 0.8,
  },
};

// Agregar estilos responsive y modo oscuro
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* Footer sin contenedor visible */
  .app-footer {
    background: transparent !important;
    border: none !important;
    padding: 12px 18px;
    width: 100%;
    text-align: center;
  }
  
  .footer-text {
    color: #bfc0d1;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.3px;
    opacity: 0.8;
    transition: opacity 0.3s ease;
  }
  
  .footer-text:hover {
    opacity: 1;
  }
  
  /* Modo oscuro */
  [data-theme="dark"] .footer-text {
    color: #9ca3b8;
  }
  
  /* Ajustar padding-bottom de las páginas en móvil */
  @media (max-width: 768px) {
    .page-container,
    .vega-score-page,
    .vega-root,
    .ranking-page,
    .admin-page,
    .profile-page,
    .notifications-page,
    .stats-page,
    .profile-container,
    .ranking-container,
    .admin-container {
      padding-bottom: 20px !important;
      min-height: auto !important;
    }
    
    .matches-container,
    .ranking-list-premium,
    .admin-content,
    .profile-bottom-section,
    .history-card,
    .notifications-list {
      padding-bottom: 20px !important;
    }
    
    .app-footer {
      padding: 10px 12px !important;
      margin-bottom: 70px !important;
      margin-top: 0 !important;
    }
    
    .footer-text {
      font-size: 11px !important;
    }
  }
  
  @media (max-width: 480px) {
    .page-container,
    .vega-score-page,
    .vega-root,
    .ranking-page,
    .admin-page,
    .profile-page,
    .notifications-page,
    .stats-page,
    .profile-container,
    .ranking-container,
    .admin-container {
      padding-bottom: 15px !important;
    }
    
    .matches-container,
    .ranking-list-premium,
    .admin-content,
    .profile-bottom-section,
    .history-card,
    .notifications-list {
      padding-bottom: 15px !important;
    }
    
    .app-footer {
      padding: 8px 10px !important;
      margin-bottom: 65px !important;
    }
    
    .footer-text {
      font-size: 10px !important;
    }
  }
`;
document.head.appendChild(styleSheet);
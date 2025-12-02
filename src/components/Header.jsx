// src/components/Header.jsx (Ajuste estructural para móvil)

import React from "react";
import { Link, useLocation } from "react-router-dom"; 
import { 
    Trophy, LogOut, User2, Home, BarChart3, Crown 
} from "lucide-react"; 
import { supabase } from "../utils/supabaseClient";
import "../styles/Header.css";

// Recibimos isAdmin como prop
export default function Header({ currentUser, isAdmin }) { 
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getNavLinkClass = (path) => 
    `icon-btn ${location.pathname === path || (path === '/app' && location.pathname === '/') ? 'active' : ''}`;

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Logo/Título */}
        <div className="logo-box">
          <Trophy size={28} />
          <h1 className="app-title">Vega Score</h1> {/* Título para desktop/tablet */}
        </div>
        
        {/* Navegación Principal (Iconos) */}
        <nav className="main-nav">
            <Link to="/app" className={getNavLinkClass('/app')} title="Dashboard">
                <Home size={18} />
            </Link>
            
            <Link to="/ranking" className={getNavLinkClass('/ranking')} title="Ranking">
                <BarChart3 size={18} /> 
            </Link>
            
            {isAdmin && (
                <Link to="/admin" className={getNavLinkClass('/admin')} title="Admin">
                    <Crown size={18} />
                </Link>
            )}
            
            {/* BOTÓN DE PERFIL: Agregado a la navegación principal para agruparlo */}
            <Link to="/profile" className={getNavLinkClass('/profile')} title="Perfil">
                <User2 size={18} />
            </Link>
        </nav>
      </div>

     <div className="header-right">
        {/* NOMBRE DE USUARIO: Solo visible en desktop/tablet */}
        <span className="user-name-display">{currentUser?.name}</span>
        
        {/* BOTÓN DE LOGOUT: Siempre a la derecha, separado */}
        <button className="icon-btn logout-btn" onClick={handleLogout} aria-label="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
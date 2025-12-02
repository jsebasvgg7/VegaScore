import React from "react";
import { Link, useLocation } from "react-router-dom"; 
import { 
    Trophy, LogOut, User2, Home, BarChart3, Crown // Home (Dashboard), BarChart3 (Ranking), Crown (Admin)
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
    // Usamos icon-btn como clase base

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-box">
          <Trophy size={28} />
        </div>
        
        {/* Agrupamos la navegación principal a la izquierda */}
        <nav className="main-nav">
            {/* 1. DASHBOARD (Casa) */}
            <Link to="/app" className={getNavLinkClass('/app')} title="Dashboard">
                <Home size={18} />
            </Link>
            
            {/* 2. RANKING (Trofeo/BarChart) */}
            <Link to="/ranking" className={getNavLinkClass('/ranking')} title="Ranking">
                <BarChart3 size={18} /> 
            </Link>
            
            {/* 3. ADMIN (Corona) */}
            {isAdmin && (
                <Link to="/admin" className={getNavLinkClass('/admin')} title="Admin">
                    <Crown size={18} />
                </Link>
            )}
        </nav>
        
        {/* El título puede ir opcionalmente aquí si hay espacio */}
        {/* <div className="title-wrap"><h1 className="app-title">Vega Score</h1></div> */}
      </div>

     <div className="header-right">
        {/* El nombre de usuario se mantiene */}
        <span className="user-name-display">{currentUser?.name}</span>

        {/* Botón de perfil (Ya es icon-btn) */}
        <Link to="/profile" className="icon-btn profile-btn" aria-label="Ver perfil">
          <User2 size={18} />
        </Link>

        {/* Botón de Logout (Ya es icon-btn) */}
        <button className="icon-btn" onClick={handleLogout} aria-label="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
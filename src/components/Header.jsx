import React from "react";
import { Trophy, LogOut, User2, Award, Shield } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";

export default function Header({ currentUser, users = [], onProfileClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const position = currentUser ? users.findIndex((u) => u.id === currentUser.id) + 1 : 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleHomeClick = () => {
    navigate("/app");
  };

  const handleRankingClick = () => {
    navigate("/ranking");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="logo-box-button" 
          onClick={handleHomeClick}
          aria-label="Ir al inicio"
          title="Volver al Inicio"
        >
          <Trophy size={28} />
        </button>
        <div className="title-wrap">
          <h1 className="app-title">GlobalScore</h1>
          <div className="app-sub">
            {location.pathname === '/app' && 'Inicio'}
            {location.pathname === '/ranking' && 'Ranking'}
            {location.pathname === '/admin' && 'Administración'}
            {location.pathname === '/profile' && 'Perfil'}
          </div>
        </div>
      </div>

      <div className="header-right">
        {currentUser?.is_admin && (
          <button 
            className="icon-btn admin-btn" 
            onClick={handleAdminClick} 
            aria-label="Panel de administración"
            title="Panel de Administración"
          >
            <Shield size={18} />
          </button>
        )}

        <button 
          className="icon-btn ranking-btn" 
          onClick={handleRankingClick} 
          aria-label="Ver ranking"
          title="Ver Ranking Global"
        >
          <Award size={18} />
          {position > 0 && <span className="position-badge">#{position}</span>}
        </button>

        <button 
          className="icon-btn profile-btn" 
          onClick={handleProfileClick} 
          aria-label="Ver perfil"
          title="Ver Perfil"
        >
          <User2 size={18} />
        </button>

        <button 
          className="icon-btn" 
          onClick={handleLogout} 
          aria-label="Cerrar sesión"
          title="Cerrar Sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
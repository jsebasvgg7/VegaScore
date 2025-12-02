// src/components/Header.jsx
import React from "react";
import { Trophy, LogOut, User2, Award } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

export default function Header({ currentUser, users = [], onProfileClick }) {
  const navigate = useNavigate();
  const position = currentUser ? users.findIndex((u) => u.id === currentUser.id) + 1 : 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleRankingClick = () => {
    navigate("/ranking");
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-box">
          <Trophy size={28} />
        </div>
        <div className="title-wrap">
          <h1 className="app-title">Vega Score</h1>
          <div className="app-sub">Inicio</div>
        </div>
      </div>

      <div className="header-right">
        {/* Botón de ranking con badge de posición */}
        <button 
          className="icon-btn ranking-btn" 
          onClick={handleRankingClick} 
          aria-label="Ver ranking"
          title="Ver Ranking Global"
        >
          <Award size={18} />
          {position > 0 && <span className="position-badge">#{position}</span>}
        </button>
        {/* Botón de admin si es admin */}
        {currentUser?.is_admin && (
        <button 
          className="icon-btn admin-btn" 
          onClick={() => navigate('/admin')} 
          aria-label="Panel de administración"
          title="Panel de Administración"
        >
          <Shield size={18} />
        </button>
        )}

        {/* Botón de perfil */}
        <button 
          className="icon-btn profile-btn" 
          onClick={onProfileClick} 
          aria-label="Ver perfil"
          title="Ver Perfil"
        >
          <User2 size={18} />
        </button>

        {/* Botón de logout */}
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
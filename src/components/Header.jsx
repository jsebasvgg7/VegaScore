// src/components/Header.jsx - VERSIÓN ACTUALIZADA CON BOTÓN DE PERFIL
import React from "react";
import { Trophy, User, LogOut, User2 } from "lucide-react"; // ← AGREGAR User2
import { supabase } from "../utils/supabaseClient";
import "../styles/Header.css";

export default function Header({ currentUser, users = [], onProfileClick }) { // ← AGREGAR onProfileClick
  const position = currentUser ? users.findIndex((u) => u.id === currentUser.id) + 1 : 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
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
        {/* Botón de perfil */}
        <button className="icon-btn profile-btn" onClick={onProfileClick} aria-label="Ver perfil">
          <User2 size={18} />
        </button>

        <button className="icon-btn" onClick={handleLogout} aria-label="Cerrar sesión">
          <LogOut size={18} />
        </button>
        
      </div>
    </header>
  );
}
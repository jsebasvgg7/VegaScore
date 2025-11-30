// src/components/Header.jsx
import React from "react";
import { supabase } from "../utils/supabaseClient";
import "../index.css";

export default function Header({ currentUser, users = [] }) {
  const position = currentUser ? users.findIndex((u) => u.id === currentUser.id) + 1 : 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-box">🏆</div>
        <div className="title-wrap">
          <h1 className="app-title">Predicciones de Fútbol</h1>
          <div className="app-sub">Compite y demuestra tu conocimiento</div>
        </div>
      </div>

      <div className="header-right">
        <div className="user-bubble">
          <div className="avatar">👤</div>
          <div className="user-info">
            <div className="user-name">{currentUser?.name ?? "Invitado"}</div>
            <div className="user-meta">{currentUser?.points ?? 0} pts • #{position} de {users.length}</div>
          </div>
        </div>

        <button className="icon-btn" onClick={handleLogout} aria-label="Cerrar sesión">
          🚪
        </button>
      </div>
    </header>
  );
}
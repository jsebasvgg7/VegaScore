// src/components/Header.jsx
import React from "react";
import "../index.css";

export default function Header({ currentUser, onOpenUserModal, onToggleSettings, onOpenAdmin, users = [] }) {
  const position = currentUser ? users.findIndex((u) => u.id === currentUser.id) + 1 : 0;

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
        <div className="user-bubble" onClick={onOpenUserModal}>
          <div className="avatar">👤</div>
          <div className="user-info">
            <div className="user-name">{currentUser?.name ?? "Invitado"}</div>
            <div className="user-meta">{currentUser?.points ?? 0} pts • #{position} de {users.length}</div>
          </div>
        </div>

        <button className="icon-btn" onClick={onToggleSettings} aria-label="settings">⚙️</button>
      </div>
    </header>
  );
}

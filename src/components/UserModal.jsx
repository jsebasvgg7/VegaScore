// src/components/UserModal.jsx
import React, { useState } from "react";
import "../index.css";

export default function UserModal({ users = [], onSelect, onCreate, onClose }) {
  const [newUsername, setNewUsername] = useState("");

  const handleCreate = () => {
    if (!newUsername.trim()) return;
    const newUser = { id: Date.now().toString(), name: newUsername.trim(), points: 0, predictions: 0, correct: 0 };
    onCreate(newUser);
    setNewUsername("");
  };

  return (
    <div className="modal-backdrop">
      <div className="modal rounded-2xl">
        <h3 className="modal-title">Seleccionar Usuario</h3>

        <div className="user-list">
          {users.map((u) => (
            <button key={u.id} className="user-row" onClick={() => onSelect(u)}>
              <span>{u.name}</span>
              <span>{u.points} pts</span>
            </button>
          ))}
        </div>

        <div className="modal-body">
          <h4>Crear Nuevo Usuario</h4>
          <div className="row">
            <input className="input" placeholder="Nombre" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
            <button className="btn" onClick={handleCreate}>Crear</button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

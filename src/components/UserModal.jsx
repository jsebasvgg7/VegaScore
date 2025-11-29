// src/components/UserModal.jsx
import React from "react";

export default function UserModal({ onClose, users, onSelect }) {
  return (
    <div className="modal-backdrop">
      <div className="modal card">

        <h2 className="modal-title">Usuarios Registrados</h2>

        <ul className="modal-user-list">
          {users.map((u) => (
            <li
              key={u.id}
              className="modal-user-item"
              onClick={() => onSelect(u)}
            >
              <span className="user-avatar">{u.name[0]}</span>
              <span className="user-name">{u.name}</span>
            </li>
          ))}
        </ul>

        <button className="btn secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

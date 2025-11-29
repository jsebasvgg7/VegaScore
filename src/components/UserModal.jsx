// src/components/UserModal.jsx
import React, { useState } from 'react';

export default function UserModal({ users, onSelect, onCreate, onClose }) {
  const [newUsername, setNewUsername] = useState('');

  const handleCreate = () => {
    if (!newUsername.trim()) return;

    const newUser = {
      id: Date.now().toString(),
      name: newUsername.trim(),
      points: 0,
      predictions: 0,
      correct: 0
    };

    onCreate(newUser);
    setNewUsername('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-2xl font-bold mb-4">Seleccionar Usuario</h3>

        <div className="space-y-3 mb-4">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className="w-full flex items-center justify-between p-3 bg-zinc-100 hover:bg-zinc-200 rounded-lg"
            >
              <span className="font-semibold">{user.name}</span>
              <span className="text-sm text-zinc-600">{user.points} pts</span>
            </button>
          ))}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Crear Nuevo Usuario</h4>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />

            <button
              onClick={handleCreate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg"
            >
              Crear
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-zinc-200 px-4 py-2 rounded-lg"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

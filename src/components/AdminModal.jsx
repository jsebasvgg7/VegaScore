// src/components/AdminModal.jsx
import React, { useState } from 'react';

export default function AdminModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    homeTeam: '',
    awayTeam: '',
    homeTeamLogo: '',
    awayTeamLogo: '',
    league: 'Liga',
    date: '',
    time: ''
  });

  const submit = () => {
    if (!form.homeTeam || !form.awayTeam || !form.date || !form.time)
      return alert('Completa los campos obligatorios');

    const match = {
      id: Date.now().toString(),
      homeTeam: form.homeTeam,
      awayTeam: form.awayTeam,
      homeTeamLogo: form.homeTeamLogo || '⚽',
      awayTeamLogo: form.awayTeamLogo || '⚽',
      league: form.league,
      date: form.date,
      time: form.time,
      status: 'pending',
      predictions: [],
      result: null
    };

    onAdd(match);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-2xl font-bold mb-4">Agregar Partido</h3>

        <div className="space-y-3">
          <input
            value={form.homeTeam}
            onChange={(e) => setForm({ ...form, homeTeam: e.target.value })}
            placeholder="Equipo Local *"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            value={form.homeTeamLogo}
            onChange={(e) => setForm({ ...form, homeTeamLogo: e.target.value })}
            placeholder="Logo Local (emoji)"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            value={form.awayTeam}
            onChange={(e) => setForm({ ...form, awayTeam: e.target.value })}
            placeholder="Equipo Visitante *"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            value={form.awayTeamLogo}
            onChange={(e) => setForm({ ...form, awayTeamLogo: e.target.value })}
            placeholder="Logo Visitante (emoji)"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            value={form.league}
            onChange={(e) => setForm({ ...form, league: e.target.value })}
            placeholder="Liga"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            value={form.date}
            type="date"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            value={form.time}
            type="time"
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={submit}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Agregar
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-zinc-200 px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

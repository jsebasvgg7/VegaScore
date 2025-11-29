// src/components/AdminModal.jsx
import React, { useState } from "react";
import "../index.css";

export default function AdminModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    homeTeam: "",
    awayTeam: "",
    homeTeamLogo: "",
    awayTeamLogo: "",
    league: "Liga",
    date: "",
    time: "",
  });

  const submit = () => {
    if (!form.homeTeam || !form.awayTeam || !form.date || !form.time) return alert("Completa los campos obligatorios");
    const match = {
      id: Date.now().toString(),
      homeTeam: form.homeTeam,
      awayTeam: form.awayTeam,
      homeTeamLogo: form.homeTeamLogo || "⚽",
      awayTeamLogo: form.awayTeamLogo || "⚽",
      league: form.league,
      date: form.date,
      time: form.time,
      status: "pending",
      predictions: [],
      result: null,
    };
    onAdd(match);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal rounded-2xl">
        <h3 className="modal-title">Agregar Partido</h3>

        <div className="modal-body">
          <input value={form.homeTeam} onChange={(e) => setForm({ ...form, homeTeam: e.target.value })} placeholder="Equipo Local *" className="input" />
          <input value={form.homeTeamLogo} onChange={(e) => setForm({ ...form, homeTeamLogo: e.target.value })} placeholder="Logo Local (emoji)" className="input" />
          <input value={form.awayTeam} onChange={(e) => setForm({ ...form, awayTeam: e.target.value })} placeholder="Equipo Visitante *" className="input" />
          <input value={form.awayTeamLogo} onChange={(e) => setForm({ ...form, awayTeamLogo: e.target.value })} placeholder="Logo Visitante (emoji)" className="input" />
          <input value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value })} placeholder="Liga" className="input" />
          <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="input" />
          <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} type="time" className="input" />
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={submit}>Agregar</button>
          <button className="btn secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

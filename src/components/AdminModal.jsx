// src/components/AdminModal.jsx
import React, { useState } from "react";

export default function AdminModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: "",
    league: "",
    homeTeam: "",
    awayTeam: "",
    homeTeamLogo: "🏠",
    awayTeamLogo: "✈️",
    date: "",
    time: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = () => {
    if (!form.id || !form.homeTeam || !form.awayTeam) {
      alert("Todos los campos son obligatorios");
      return;
    }

    onAdd({
      ...form,
      status: "pending",
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal card">

        <h2 className="modal-title">Agregar Partido</h2>

        <input className="input" name="id" placeholder="ID" onChange={handleChange} />
        <input className="input" name="league" placeholder="Liga" onChange={handleChange} />
        <input className="input" name="homeTeam" placeholder="Equipo Local" onChange={handleChange} />
        <input className="input" name="awayTeam" placeholder="Equipo Visitante" onChange={handleChange} />

        <input className="input" name="date" type="date" onChange={handleChange} />
        <input className="input" name="time" type="time" onChange={handleChange} />

        <button className="btn" onClick={submit}>Agregar</button>
        <button className="btn secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

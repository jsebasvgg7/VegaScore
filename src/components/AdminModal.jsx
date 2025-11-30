// src/components/AdminModal.jsx
import React, { useState } from "react";

export default function AdminModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: "",
    league: "",
    home_team: "",  // ✅ Cambiado de homeTeam
    away_team: "",  // ✅ Cambiado de awayTeam
    home_team_logo: "🏠",  // ✅ Cambiado
    away_team_logo: "✈️",  // ✅ Cambiado
    date: "",
    time: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = () => {
    if (!form.id || !form.home_team || !form.away_team || !form.date || !form.time) {
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

        <input 
          className="input" 
          name="id" 
          placeholder="ID (ej: match-001)" 
          value={form.id}
          onChange={handleChange} 
        />
        
        <input 
          className="input" 
          name="league" 
          placeholder="Liga (ej: Premier League)" 
          value={form.league}
          onChange={handleChange} 
        />
        
        <input 
          className="input" 
          name="home_team" 
          placeholder="Equipo Local" 
          value={form.home_team}
          onChange={handleChange} 
        />
        
        <input 
          className="input" 
          name="away_team" 
          placeholder="Equipo Visitante" 
          value={form.away_team}
          onChange={handleChange} 
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input 
            className="input" 
            name="home_team_logo" 
            placeholder="Logo Local (emoji)" 
            value={form.home_team_logo}
            onChange={handleChange}
            maxLength={2}
          />
          
          <input 
            className="input" 
            name="away_team_logo" 
            placeholder="Logo Visitante (emoji)" 
            value={form.away_team_logo}
            onChange={handleChange}
            maxLength={2}
          />
        </div>

        <input 
          className="input" 
          name="date" 
          type="date" 
          value={form.date}
          onChange={handleChange} 
        />
        
        <input 
          className="input" 
          name="time" 
          type="time" 
          value={form.time}
          onChange={handleChange} 
        />

        <button className="btn" onClick={submit}>Agregar Partido</button>
        <button className="btn secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
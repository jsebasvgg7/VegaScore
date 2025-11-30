import React, { useState } from "react";
import { X, Plus, Calendar, Clock, Shield, Zap, Home, Plane } from "lucide-react";

export default function AdminModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: "",
    league: "",
    home_team: "",
    away_team: "",
    home_team_logo: "🏠",
    away_team_logo: "✈️",
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
    <div className="modal-backdrop-premium">
      <div className="modal-premium">
        {/* Header con gradiente */}
        <div className="modal-header-premium">
          <div className="modal-title-section">
            <div className="modal-icon-wrapper">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="modal-title-premium">Agregar Nuevo Partido</h2>
              <p className="modal-subtitle-premium">Completa la información del partido</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Formulario con diseño mejorado */}
        <div className="modal-body-premium">
          {/* ID del partido */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Zap size={14} />
              <span>ID del Partido</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="id" 
              placeholder="Ej: match-001" 
              value={form.id}
              onChange={handleChange}
            />
            <span className="form-hint">Identificador único del partido</span>
          </div>

          {/* Liga */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Shield size={14} />
              <span>Liga o Competición</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="league" 
              placeholder="Ej: Premier League, La Liga, UEFA Champions League" 
              value={form.league}
              onChange={handleChange}
            />
          </div>

          {/* Equipos en grid */}
          <div className="teams-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Home size={14} />
                <span>Equipo Local</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="home_team" 
                placeholder="Manchester United" 
                value={form.home_team}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <Plane size={14} />
                <span>Equipo Visitante</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="away_team" 
                placeholder="Liverpool" 
                value={form.away_team}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Logos */}
          <div className="logos-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <span>Logo Local</span>
              </label>
              <div className="logo-input-wrapper">
                <input 
                  className="form-input-premium logo-input" 
                  name="home_team_logo" 
                  placeholder="🏠" 
                  value={form.home_team_logo}
                  onChange={handleChange}
                  maxLength={2}
                />
                <span className="logo-preview">{form.home_team_logo}</span>
              </div>
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <span>Logo Visitante</span>
              </label>
              <div className="logo-input-wrapper">
                <input 
                  className="form-input-premium logo-input" 
                  name="away_team_logo" 
                  placeholder="✈️" 
                  value={form.away_team_logo}
                  onChange={handleChange}
                  maxLength={2}
                />
                <span className="logo-preview">{form.away_team_logo}</span>
              </div>
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="datetime-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Calendar size={14} />
                <span>Fecha</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="date" 
                type="date" 
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <Clock size={14} />
                <span>Hora</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="time" 
                type="time" 
                value={form.time}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="modal-footer-premium">
          <button className="modal-btn-premium secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-premium primary" onClick={submit}>
            <Plus size={18} />
            <span>Agregar Partido</span>
          </button>
        </div>
      </div>
    </div>
  );
}
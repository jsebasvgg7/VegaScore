import React, { useState } from 'react';
import { X, Plus, Trophy, Calendar, Award, Star } from 'lucide-react';
import { getLogoUrlByAwardName } from '../../utils/logoHelper.js';
import { supabase } from '../utils/supabaseClient';
import '../styles/adminStyles/AdminModal.css';

export default function AdminAwardModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    season: '',
    logo: '🏆',
    category: 'Individual',
    deadline: '',
    deadline_time: ''
  });

  const categories = [
    'Individual',
    'Equipo',
    'Goleador',
    'Portero',
    'Joven',
    'Fair Play'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Auto-generar URL del logo cuando se ingresa el nombre del premio
    if (name === 'name' && value) {
      const logoUrl = getLogoUrlByAwardName(supabase, value);
      if (logoUrl) {
        setForm(prev => ({ ...prev, logo_url: logoUrl }));
      }
    }
  };

  const submit = () => {
    if (!form.id || !form.name || !form.season || !form.deadline || !form.deadline_time) {
      alert('Todos los campos son obligatorios');
      return;
    }

    // Combinar fecha y hora en formato ISO
    const deadlineISO = `${form.deadline}T${form.deadline_time}:00`;

    // Generar URL del logo automáticamente
    const logoUrl = getLogoUrlByAwardName(supabase, form.name);

    onAdd({
      id: form.id,
      name: form.name,
      season: form.season,
      logo: form.logo,       // Emoji como fallback
      logo_url: logoUrl,     // URL del logo real
      category: form.category,
      status: 'active',
      deadline: deadlineISO
    });

    onClose();
  };

  return (
    <div className="modal-backdrop-premium">
      <div className="modal-premium">
        {/* Header */}
        <div className="modal-header-premium">
          <div className="modal-title-section">
            <div className="modal-icon-wrapper">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="modal-title-premium">Agregar Nuevo Premio</h2>
              <p className="modal-subtitle-premium">Configura el premio individual</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-premium">
          {/* ID */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Trophy size={14} />
              <span>ID del Premio</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="id" 
              placeholder="Ej: balon-oro-2024, bota-oro-2024" 
              value={form.id}
              onChange={handleChange}
            />
            <span className="form-hint">Identificador único (sin espacios, usar guiones)</span>
          </div>

          {/* Nombre */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Award size={14} />
              <span>Nombre del Premio</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="name" 
              placeholder="Ej: Balón de Oro, Bota de Oro, The Best FIFA" 
              value={form.name}
              onChange={handleChange}
            />
            <span className="form-hint">El logo se asignará automáticamente según el nombre</span>
          </div>

          {/* Temporada y Categoría */}
          <div className="teams-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Calendar size={14} />
                <span>Temporada</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="season" 
                placeholder="Ej: 2024, 2024/25" 
                value={form.season}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <Star size={14} />
                <span>Categoría</span>
              </label>
              <select 
                className="form-input-premium" 
                name="category" 
                value={form.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vista previa del logo */}
          {form.name && (
            <div className="logo-preview-section">
              <div className="logo-preview-item">
                <span className="logo-preview-label">Vista previa del logo:</span>
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Award logo" className="logo-preview-img" />
                ) : (
                  <span className="logo-preview-emoji">{form.logo}</span>
                )}
              </div>
            </div>
          )}

          {/* Logo emoji (fallback) */}
          <div className="form-group-premium">
            <label className="form-label-premium">
              <span>Emoji de Respaldo</span>
            </label>
            <div className="logo-input-wrapper">
              <input 
                className="form-input-premium logo-input" 
                name="logo" 
                placeholder="🏆" 
                value={form.logo}
                onChange={handleChange}
                maxLength={2}
              />
              <span className="logo-preview">{form.logo}</span>
            </div>
            <span className="form-hint">Emoji que se mostrará si no hay logo disponible: 🏆⚽🥇🥈🥉⭐👑</span>
          </div>

          {/* Fecha límite */}
          <div className="datetime-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Calendar size={14} />
                <span>Fecha Límite</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="deadline" 
                type="date" 
                value={form.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <Calendar size={14} />
                <span>Hora Límite</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="deadline_time" 
                type="time" 
                value={form.deadline_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-hint" style={{ marginTop: '-10px', marginBottom: '10px' }}>
            Fecha y hora hasta la cual se pueden hacer predicciones
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-premium">
          <button className="modal-btn-premium secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-premium primary" onClick={submit}>
            <Plus size={18} />
            <span>Agregar Premio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
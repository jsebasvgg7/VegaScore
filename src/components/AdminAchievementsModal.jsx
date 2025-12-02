import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Trophy, Target, Flame, Star } from 'lucide-react';
import '../styles/AdminModal.css';

export default function AdminAchievementsModal({ onClose, onSave, onDelete, existingAchievement = null }) {
  const [form, setForm] = useState(existingAchievement || {
    id: '',
    name: '',
    description: '',
    icon: '🎯',
    category: 'Inicio',
    requirement_type: 'points',
    requirement_value: 0
  });

  const categories = ['Inicio', 'Progreso', 'Precisión', 'Racha'];
  const requirementTypes = [
    { value: 'points', label: 'Puntos Totales' },
    { value: 'predictions', label: 'Predicciones' },
    { value: 'correct', label: 'Aciertos' },
    { value: 'streak', label: 'Racha' }
  ];

  const iconOptions = ['🎯', '🌟', '⭐', '✨', '💫', '🎪', '🎭', '🎨', '🔥', '🌋', '☄️', '🏆', '👑', '💎', '🎖️', '🥇', '🥈', '🥉'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'requirement_value' ? parseInt(value) || 0 : value 
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.description || !form.requirement_value) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!form.id) {
      const slug = form.name.toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.id = `${slug}-${Date.now()}`;
    }

    onSave(form);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este logro? Esta acción no se puede deshacer.')) {
      onDelete(form.id);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop-premium">
      <div className="modal-premium" style={{ maxWidth: '600px' }}>
        <div className="modal-header-premium">
          <div className="modal-title-section">
            <div className="modal-icon-wrapper">
              {existingAchievement ? <Edit2 size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h2 className="modal-title-premium">
                {existingAchievement ? 'Editar Logro' : 'Crear Nuevo Logro'}
              </h2>
              <p className="modal-subtitle-premium">
                {existingAchievement ? 'Modifica los datos del logro' : 'Define los requisitos del logro'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-premium">
          <div className="form-group-premium">
            <label className="form-label-premium">
              <Trophy size={14} />
              <span>Nombre del Logro</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="name" 
              placeholder="Ej: Primer Paso, Maestro Predictor" 
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group-premium">
            <label className="form-label-premium">
              <span>Descripción</span>
              <span className="required">*</span>
            </label>
            <textarea 
              className="form-input-premium" 
              name="description" 
              placeholder="Describe cómo obtener este logro"
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="teams-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Star size={14} />
                <span>Icono</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    style={{
                      padding: '12px',
                      fontSize: '24px',
                      border: form.icon === icon ? '3px solid #60519b' : '2px solid #e5e5e5',
                      borderRadius: '12px',
                      background: form.icon === icon ? '#f3f0ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <Target size={14} />
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

          <div className="teams-grid-premium">
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Flame size={14} />
                <span>Tipo de Requisito</span>
                <span className="required">*</span>
              </label>
              <select 
                className="form-input-premium" 
                name="requirement_type" 
                value={form.requirement_type}
                onChange={handleChange}
              >
                {requirementTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">
                <span>Valor Requerido</span>
                <span className="required">*</span>
              </label>
              <input 
                className="form-input-premium" 
                name="requirement_value" 
                type="number"
                min="0"
                placeholder="Ej: 100" 
                value={form.requirement_value}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-hint" style={{ 
            marginTop: '20px', 
            padding: '16px', 
            background: '#f3f0ff', 
            borderRadius: '12px', 
            border: '2px solid rgba(96, 81, 155, 0.2)' 
          }}>
            <strong style={{ color: '#60519b' }}>Vista Previa:</strong>
            <div style={{ 
              marginTop: '12px', 
              padding: '16px', 
              background: 'white', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ fontSize: '36px' }}>{form.icon}</div>
              <div>
                <div style={{ fontWeight: '700', color: '#111', marginBottom: '4px' }}>{form.name || 'Nombre del Logro'}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{form.description || 'Descripción del logro'}</div>
                <div style={{ fontSize: '11px', color: '#60519b', fontWeight: '600', marginTop: '6px' }}>
                  {form.category} • {requirementTypes.find(t => t.value === form.requirement_type)?.label}: {form.requirement_value}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-premium">
          {existingAchievement && (
            <button 
              className="modal-btn-premium secondary" 
              onClick={handleDelete}
              style={{ 
                marginRight: 'auto',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none'
              }}
            >
              <Trash2 size={18} />
              <span>Eliminar</span>
            </button>
          )}
          <button className="modal-btn-premium secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-premium primary" onClick={handleSubmit}>
            {existingAchievement ? <Edit2 size={18} /> : <Plus size={18} />}
            <span>{existingAchievement ? 'Guardar Cambios' : 'Crear Logro'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
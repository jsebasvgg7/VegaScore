import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Crown, Award } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import '../styles/AdminModal.css';

export default function AdminTitlesModal({ onClose, onSave, onDelete, existingTitle = null }) {
  const [form, setForm] = useState(existingTitle || {
    id: '',
    name: '',
    description: '',
    color: '#7C3AED',
    requirement_achievement_id: ''
  });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('available_achievements')
        .select('*')
        .order('requirement_value', { ascending: true});

      if (error) throw error;
      setAchievements(data || []);
    } catch (err) {
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { value: '#7C3AED', label: 'Púrpura' },
    { value: '#EF4444', label: 'Rojo' },
    { value: '#F59E0B', label: 'Dorado' },
    { value: '#10B981', label: 'Verde' },
    { value: '#3B82F6', label: 'Azul' },
    { value: '#EC4899', label: 'Rosa' },
    { value: '#6366F1', label: 'Índigo' },
    { value: '#8B5CF6', label: 'Violeta' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.description || !form.requirement_achievement_id) {
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
      form.id = slug;
    }

    onSave(form);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este título? Esta acción no se puede deshacer.')) {
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
              {existingTitle ? <Edit2 size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h2 className="modal-title-premium">
                {existingTitle ? 'Editar Título' : 'Crear Nuevo Título'}
              </h2>
              <p className="modal-subtitle-premium">
                {existingTitle ? 'Modifica los datos del título' : 'Define el título y su requisito'}
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
              <Crown size={14} />
              <span>Nombre del Título</span>
              <span className="required">*</span>
            </label>
            <input 
              className="form-input-premium" 
              name="name" 
              placeholder="Ej: Novato, Pronosticador, Oráculo" 
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
              placeholder="Describe qué representa este título"
              value={form.description}
              onChange={handleChange}
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group-premium">
            <label className="form-label-premium">
              <Award size={14} />
              <span>Color del Título</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {colorOptions.map(colorOpt => (
                <button
                  key={colorOpt.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: colorOpt.value })}
                  style={{
                    padding: '14px',
                    border: form.color === colorOpt.value ? '3px solid ' + colorOpt.value : '2px solid #e5e5e5',
                    borderRadius: '12px',
                    background: form.color === colorOpt.value ? colorOpt.value + '20' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: colorOpt.value 
                  }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#666' }}>
                    {colorOpt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group-premium">
            <label className="form-label-premium">
              <Award size={14} />
              <span>Logro Requerido</span>
              <span className="required">*</span>
            </label>
            {loading ? (
              <div className="form-input-premium" style={{ color: '#999' }}>
                Cargando logros...
              </div>
            ) : (
              <select 
                className="form-input-premium" 
                name="requirement_achievement_id" 
                value={form.requirement_achievement_id}
                onChange={handleChange}
              >
                <option value="">Selecciona un logro</option>
                {achievements.map(achievement => (
                  <option key={achievement.id} value={achievement.id}>
                    {achievement.icon} {achievement.name} ({achievement.category})
                  </option>
                ))}
              </select>
            )}
            <span className="form-hint">
              El usuario debe desbloquear este logro para obtener el título
            </span>
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
              padding: '20px', 
              background: 'white', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderLeft: `4px solid ${form.color}`
            }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${form.color}, ${form.color}dd)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Crown size={28} />
              </div>
              <div>
                <div style={{ 
                  fontWeight: '900', 
                  fontSize: '18px',
                  color: form.color,
                  marginBottom: '4px' 
                }}>
                  {form.name || 'Nombre del Título'}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {form.description || 'Descripción del título'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-premium">
          {existingTitle && (
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
            {existingTitle ? <Edit2 size={18} /> : <Plus size={18} />}
            <span>{existingTitle ? 'Guardar Cambios' : 'Crear Título'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
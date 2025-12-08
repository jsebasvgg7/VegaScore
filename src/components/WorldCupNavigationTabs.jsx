// src/components/WorldCupNavigationTabs.jsx
import React from 'react';
import { Users, Target, Award } from 'lucide-react';
import '../styles/NavigationTabs.css';

export default function WorldCupNavigationTabs({ activeTab, onTabChange }) {
  return (
    <div className="navigation-tabs">
      {/* TAB: FASE DE GRUPOS */}
      <button
        className={`nav-tab ${activeTab === 'groups' ? 'active' : ''}`}
        onClick={() => onTabChange('groups')}
      >
        <Users size={20} />
        <span>Fase de Grupos</span>
        <div className="tab-indicator"></div>
      </button>

      {/* TAB: ELIMINATORIAS */}
      <button
        className={`nav-tab ${activeTab === 'knockout' ? 'active' : ''}`}
        onClick={() => onTabChange('knockout')}
      >
        <Target size={20} />
        <span>Eliminatorias</span>
        <div className="tab-indicator"></div>
      </button>

      {/* TAB: PREMIOS */}
      <button
        className={`nav-tab ${activeTab === 'awards' ? 'active' : ''}`}
        onClick={() => onTabChange('awards')}
      >
        <Award size={20} />
        <span>Premios</span>
        <div className="tab-indicator"></div>
      </button>
    </div>
  );
}
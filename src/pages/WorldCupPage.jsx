// src/pages/WorldCupPage.jsx
import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, TrendingDown, Star, Users, Target, Zap } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useToast, ToastContainer } from '../components/Toast';
import Footer from '../components/Footer';
import '../styles/pagesStyles/WorldCupPage.css';

// Datos de los grupos del Mundial 2026
const WORLD_CUP_GROUPS = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Denmark*'],
  B: ['Canada', 'Italy*', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'Turkey*'],
  E: ['Germany', 'Curacao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Poland*', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Bolivia*', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Congo*', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama']
};

// Mapeo de nombres a slugs para logos
const TEAM_LOGO_MAP = {
  'Mexico': 'mexico',
  'South Africa': 'sudafrica',
  'Korea Republic': 'coreadelsur',
  'Canada': 'canada',
  'Qatar': 'qatar',
  'Switzerland': 'suiza',
  'Brazil': 'brasil',
  'Morocco': 'marruecos',
  'Haiti': 'haiti',
  'Scotland': 'escocia',
  'USA': 'usa',
  'Paraguay': 'paraguay',
  'Australia': 'australia',
  'Germany': 'alemania',
  'Curacao': 'curacao',
  'Ivory Coast': 'costamarfil',
  'Ecuador': 'ecuador',
  'Netherlands': 'paisesbajos',
  'Japan': 'japon',
  'Tunisia': 'tunez',
  'Belgium': 'belgica',
  'Egypt': 'egipto',
  'Iran': 'iran',
  'New Zealand': 'nuevazelanda',
  'Spain': 'espana',
  'Cabo Verde': 'caboverde',
  'Saudi Arabia': 'arabiasaudita',
  'Uruguay': 'uruguay',
  'France': 'francia',
  'Senegal': 'senegal',
  'Norway': 'noruega',
  'Argentina': 'argentina',
  'Algeria': 'argelia',
  'Austria': 'austria',
  'Jordan': 'jordan',
  'Portugal': 'portugal',
  'Uzbekistan': 'uzbekistan',
  'Colombia': 'colombia',
  'England': 'inglaterra',
  'Croatia': 'croacia',
  'Ghana': 'ghana',
  'Panama': 'panama',
  'Denmark*': 'dinamarca',
  'Turkey*': 'turquia',
  'Italy*': 'italia',
  'Poland*': 'polonia',
  'Bolivia*': 'bolivia',
  'Congo*': 'congo'
};

export default function WorldCupPage({ currentUser }) {
  const [activeTab, setActiveTab] = useState('groups');
  const [predictions, setPredictions] = useState({
    groups: {},
    knockout: {
      round16: {},
      quarters: {},
      semis: {},
      final: {},
      thirdPlace: {}
    },
    awards: {
      topScorer: '',
      topAssist: '',
      surpriseTeam: '',
      disappointmentTeam: '',
      breakoutPlayer: '',
      disappointmentPlayer: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    loadPredictions();
  }, [currentUser]);

  const loadPredictions = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('worldcup_predictions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPredictions({
          groups: data.groups_predictions || {},
          knockout: data.knockout_predictions || {
            round16: {},
            quarters: {},
            semis: {},
            final: {},
            thirdPlace: {}
          },
          awards: data.awards_predictions || {
            topScorer: '',
            topAssist: '',
            surpriseTeam: '',
            disappointmentTeam: '',
            breakoutPlayer: '',
            disappointmentPlayer: ''
          }
        });
      }
    } catch (err) {
      console.error('Error loading predictions:', err);
      toast.error('Error al cargar predicciones');
    } finally {
      setLoading(false);
    }
  };

  const savePredictions = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('worldcup_predictions')
        .upsert({
          user_id: currentUser.id,
          groups_predictions: predictions.groups,
          knockout_predictions: predictions.knockout,
          awards_predictions: predictions.awards,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      toast.success('¡Predicciones guardadas exitosamente! 🏆');
    } catch (err) {
      console.error('Error saving predictions:', err);
      toast.error('Error al guardar predicciones');
    } finally {
      setSaving(false);
    }
  };

  const handleGroupPrediction = (group, position, team) => {
    setPredictions(prev => ({
      ...prev,
      groups: {
        ...prev.groups,
        [group]: {
          ...prev.groups[group],
          [position]: team
        }
      }
    }));
  };

  const handleAwardPrediction = (award, value) => {
    setPredictions(prev => ({
      ...prev,
      awards: {
        ...prev.awards,
        [award]: value
      }
    }));
  };

  const getTeamLogoUrl = (teamName) => {
    const slug = TEAM_LOGO_MAP[teamName];
    if (!slug) return null;
    
    return supabase.storage
      .from('world-cup-logos')
      .getPublicUrl(`${slug}.png`).data.publicUrl;
  };

  const renderTeamLogo = (teamName) => {
    const logoUrl = getTeamLogoUrl(teamName);
    
    if (logoUrl) {
      return (
        <img 
          src={logoUrl} 
          alt={teamName}
          className="team-flag"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'block';
          }}
        />
      );
    }
    
    return <span className="team-flag-emoji">❓</span>;
  };

  if (loading) {
    return (
      <div className="worldcup-page-loading">
        <div className="spinner-large"></div>
        <p>Cargando predicciones del Mundial...</p>
      </div>
    );
  }

  return (
    <>
      <div className="worldcup-page">
        <div className="worldcup-container">
          {/* Header - SIN BOTÓN */}
          <div className="worldcup-header">
            <div className="worldcup-header-content">
              <div className="worldcup-icon">
                <Trophy size={40} />
              </div>
              <div>
                <h1 className="worldcup-title">Llamada Mundialista 2026</h1>
                <p className="worldcup-subtitle">FIFA World Cup - USA, Canada & Mexico</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Con clase para ocultar texto en móvil */}
          <div className="worldcup-nav-tabs">
            <button 
              className={`worldcup-nav-tab ${activeTab === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveTab('groups')}
            >
              <Users size={20} />
              <span className="worldcup-nav-tab-text">Fase de Grupos</span>
            </button>
            <button 
              className={`worldcup-nav-tab ${activeTab === 'knockout' ? 'active' : ''}`}
              onClick={() => setActiveTab('knockout')}
            >
              <Target size={20} />
              <span className="worldcup-nav-tab-text">Eliminatorias</span>
            </button>
            <button 
              className={`worldcup-nav-tab ${activeTab === 'awards' ? 'active' : ''}`}
              onClick={() => setActiveTab('awards')}
            >
              <Award size={20} />
              <span className="worldcup-nav-tab-text">Premios</span>
            </button>
          </div>

          {/* Content */}
          {activeTab === 'groups' && (
            <div className="groups-section">
              <div className="groups-grid">
                {Object.entries(WORLD_CUP_GROUPS).map(([group, teams]) => (
                  <div key={group} className="group-card">
                    <div className="group-header">
                      <h3>Grupo {group}</h3>
                    </div>
                    
                    <div className="group-teams">
                      {teams.map((team, idx) => (
                        <div key={idx} className="group-team-item">
                          {renderTeamLogo(team)}
                          <span className="team-name">{team}</span>
                        </div>
                      ))}
                    </div>

                    <div className="group-predictions">
                      <div className="prediction-field">
                        <label>1º Lugar</label>
                        <select 
                          value={predictions.groups[group]?.first || ''}
                          onChange={(e) => handleGroupPrediction(group, 'first', e.target.value)}
                        >
                          <option value="">Selecciona...</option>
                          {teams.map((team, idx) => (
                            <option key={idx} value={team}>{team}</option>
                          ))}
                        </select>
                      </div>

                      <div className="prediction-field">
                        <label>2º Lugar</label>
                        <select 
                          value={predictions.groups[group]?.second || ''}
                          onChange={(e) => handleGroupPrediction(group, 'second', e.target.value)}
                        >
                          <option value="">Selecciona...</option>
                          {teams.map((team, idx) => (
                            <option key={idx} value={team}>{team}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTÓN AL FINAL DE LOS GRUPOS */}
              <button 
                className="save-predictions-btn"
                onClick={savePredictions}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}

          {activeTab === 'knockout' && (
            <div className="knockout-section">
              <div className="knockout-bracket">
                <div className="bracket-info">
                  <p>Las eliminatorias se habilitarán una vez finalice la fase de grupos</p>
                </div>
              </div>

              {/* BOTÓN AL FINAL DE KNOCKOUT */}
              <button 
                className="save-predictions-btn"
                onClick={savePredictions}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}

          {activeTab === 'awards' && (
            <div className="awards-section">
              <div className="awards-grid">
                <div className="award-card">
                  <div className="award-icon">
                    <Trophy size={24} />
                  </div>
                  <label>Máximo Goleador</label>
                  <input
                    type="text"
                    placeholder="Nombre del jugador"
                    value={predictions.awards.topScorer}
                    onChange={(e) => handleAwardPrediction('topScorer', e.target.value)}
                  />
                </div>

                <div className="award-card">
                  <div className="award-icon">
                    <Target size={24} />
                  </div>
                  <label>Máximo Asistidor</label>
                  <input
                    type="text"
                    placeholder="Nombre del jugador"
                    value={predictions.awards.topAssist}
                    onChange={(e) => handleAwardPrediction('topAssist', e.target.value)}
                  />
                </div>

                <div className="award-card">
                  <div className="award-icon">
                    <TrendingUp size={24} />
                  </div>
                  <label>Selección Sorpresa</label>
                  <input
                    type="text"
                    placeholder="Nombre de la selección"
                    value={predictions.awards.surpriseTeam}
                    onChange={(e) => handleAwardPrediction('surpriseTeam', e.target.value)}
                  />
                </div>

                <div className="award-card">
                  <div className="award-icon">
                    <TrendingDown size={24} />
                  </div>
                  <label>Selección Decepción</label>
                  <input
                    type="text"
                    placeholder="Nombre de la selección"
                    value={predictions.awards.disappointmentTeam}
                    onChange={(e) => handleAwardPrediction('disappointmentTeam', e.target.value)}
                  />
                </div>

                <div className="award-card">
                  <div className="award-icon">
                    <Star size={24} />
                  </div>
                  <label>Jugador Revelación</label>
                  <input
                    type="text"
                    placeholder="Nombre del jugador"
                    value={predictions.awards.breakoutPlayer}
                    onChange={(e) => handleAwardPrediction('breakoutPlayer', e.target.value)}
                  />
                </div>

                <div className="award-card">
                  <div className="award-icon">
                    <Zap size={24} />
                  </div>
                  <label>Jugador Decepción</label>
                  <input
                    type="text"
                    placeholder="Nombre del jugador"
                    value={predictions.awards.disappointmentPlayer}
                    onChange={(e) => handleAwardPrediction('disappointmentPlayer', e.target.value)}
                  />
                </div>
              </div>

              {/* BOTÓN AL FINAL DE AWARDS */}
              <button 
                className="save-predictions-btn"
                onClick={savePredictions}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
          <Footer /> 
        </div>
      </div>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}
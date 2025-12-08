// src/pages/WorldCupPage.jsx
import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, TrendingDown, Star, Users, Target, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useToast, ToastContainer } from '../components/Toast';
import { useWorldCup } from '../hooks/useWorldCup';
import Footer from '../components/Footer';
import '../styles/pagesStyles/WorldCupPage.css';

// ============================================
// DATOS DE GRUPOS
// ============================================
const GROUPS_DATA = {
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

// Helper para obtener banderas
const TEAM_LOGO_MAP = {
  'Mexico': 'mexico',
  'South Africa': 'sudafrica',
  'Korea Republic': 'coreadelsur',
  'Denmark*': 'dinamarca',
  'Canada': 'canada',
  'Italy*': 'italia',
  'Qatar': 'qatar',
  'Switzerland': 'suiza',
  'Brazil': 'brasil',
  'Morocco': 'marruecos',
  'Haiti': 'haiti',
  'Scotland': 'escocia',
  'USA': 'usa',
  'Paraguay': 'paraguay',
  'Australia': 'australia',
  'Turkey*': 'turquia',
  'Germany': 'alemania',
  'Curacao': 'curacao',
  'Ivory Coast': 'costamarfil',
  'Ecuador': 'ecuador',
  'Netherlands': 'paisesbajos',
  'Japan': 'japon',
  'Poland*': 'polonia',
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
  'Bolivia*': 'bolivia',
  'Norway': 'noruega',
  'Argentina': 'argentina',
  'Algeria': 'argelia',
  'Austria': 'austria',
  'Jordan': 'jordan',
  'Portugal': 'portugal',
  'Congo*': 'congo',
  'Uzbekistan': 'uzbekistan',
  'Colombia': 'colombia',
  'England': 'inglaterra',
  'Croatia': 'croacia',
  'Ghana': 'ghana',
  'Panama': 'panama'
};

// Helper para obtener banderas desde Supabase Storage
const getTeamFlag = (team) => {
  const slug = TEAM_LOGO_MAP[team];
  if (!slug) return null;
  
  return supabase.storage
    .from('world-cup-logos')
    .getPublicUrl(`${slug}.png`).data.publicUrl;
};

// ============================================
// COMPONENTE: GROUP CARD
// ============================================
const GroupCard = ({ group, teams, predictions, onUpdatePrediction, expanded, onToggle }) => {
  const matches = [
    [teams[0], teams[1]], [teams[2], teams[3]],
    [teams[0], teams[2]], [teams[1], teams[3]],
    [teams[0], teams[3]], [teams[1], teams[2]]
  ];

  const groupPredictions = predictions[group] || {};
  const matchPredictions = groupPredictions.matches || {};

  const handleMatchPrediction = (matchIdx, homeScore, awayScore) => {
    const newMatches = { ...matchPredictions, [matchIdx]: { homeScore, awayScore } };
    onUpdatePrediction(group, { ...groupPredictions, matches: newMatches });
  };

  const calculateTable = () => {
    const table = teams.map(team => ({
      team, played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, ga: 0, gd: 0, points: 0
    }));

    Object.entries(matchPredictions).forEach(([idx, pred]) => {
      const [home, away] = matches[idx];
      const homeIdx = teams.indexOf(home);
      const awayIdx = teams.indexOf(away);
      
      if (pred.homeScore !== '' && pred.awayScore !== '') {
        const hs = parseInt(pred.homeScore);
        const as = parseInt(pred.awayScore);
        
        table[homeIdx].played++;
        table[awayIdx].played++;
        table[homeIdx].gf += hs;
        table[homeIdx].ga += as;
        table[awayIdx].gf += as;
        table[awayIdx].ga += hs;
        
        if (hs > as) {
          table[homeIdx].won++;
          table[homeIdx].points += 3;
          table[awayIdx].lost++;
        } else if (hs < as) {
          table[awayIdx].won++;
          table[awayIdx].points += 3;
          table[homeIdx].lost++;
        } else {
          table[homeIdx].drawn++;
          table[awayIdx].drawn++;
          table[homeIdx].points++;
          table[awayIdx].points++;
        }
        
        table[homeIdx].gd = table[homeIdx].gf - table[homeIdx].ga;
        table[awayIdx].gd = table[awayIdx].gf - table[awayIdx].ga;
      }
    });

    return table.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  };

  const table = calculateTable();

  return (
    <div className="group-card">
      <div className="group-header" onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={20} />
          <h3>Grupo {group}</h3>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      <div className="group-teams">
        <div className="group-table-container">
          <table className="group-table">
            <thead>
              <tr>
                <th>POS</th>
                <th>EQUIPO</th>
                <th>PJ</th>
                <th>G</th>
                <th>E</th>
                <th>P</th>
                <th>GF</th>
                <th>GC</th>
                <th>DG</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, idx) => (
                <tr key={idx} className={idx < 2 ? 'qualified' : idx === 2 ? 'third-place' : ''}>
                  <td className="pos-col">{idx + 1}</td>
                  <td className="team-col">
                    <img 
                      src={getTeamFlag(row.team)} 
                      alt={row.team}
                      className="team-flag"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <span className="team-name">{row.team}</span>
                  </td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>{row.gf}</td>
                  <td>{row.ga}</td>
                  <td className={`gd-col ${row.gd > 0 ? 'positive' : row.gd < 0 ? 'negative' : ''}`}>
                    {row.gd > 0 ? '+' : ''}{row.gd}
                  </td>
                  <td className="pts-col">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="scroll-hint">👆 Desliza para ver más →</div>
      </div>

      {expanded && (
        <div className="group-predictions">
          <h4>📋 PARTIDOS DEL GRUPO</h4>
          <div className="matches-grid">
            {matches.map((match, idx) => {
              const pred = matchPredictions[idx] || { homeScore: '', awayScore: '' };
              return (
                <div key={idx} className="match-prediction">
                  <div className="match-team home-team">
                    <span>{match[0]}</span>
                    <img 
                      src={getTeamFlag(match[0])} 
                      alt={match[0]}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                  
                  <div className="match-scores">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={pred.homeScore}
                      onChange={(e) => handleMatchPrediction(idx, e.target.value, pred.awayScore)}
                      placeholder="0"
                    />
                    <span className="separator">-</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={pred.awayScore}
                      onChange={(e) => handleMatchPrediction(idx, pred.homeScore, e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="match-team away-team">
                    <img 
                      src={getTeamFlag(match[1])} 
                      alt={match[1]}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <span>{match[1]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function WorldCupPage({ currentUser }) {
  const [activeTab, setActiveTab] = useState('groups');
  const [predictions, setPredictions] = useState({
    groups: {},
    knockout: { round16: {}, quarters: {}, semis: {}, final: {}, thirdPlace: {} },
    awards: {
      topScorer: '', topAssist: '', surpriseTeam: '',
      disappointmentTeam: '', breakoutPlayer: '', disappointmentPlayer: ''
    }
  });
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();
  const { loadPredictions, savePredictions, loading: saving } = useWorldCup(currentUser);

  useEffect(() => {
    loadUserPredictions();
  }, [currentUser]);

  const loadUserPredictions = async () => {
    try {
      const data = await loadPredictions();
      if (data) {
        setPredictions(data);
      }
    } catch (err) {
      console.error('Error loading predictions:', err);
      toast.error('Error al cargar predicciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    await savePredictions(
      predictions,
      () => toast.success('¡Predicciones guardadas exitosamente! 🏆'),
      (error) => toast.error(`Error: ${error}`)
    );
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleGroupUpdate = (group, data) => {
    setPredictions(prev => ({
      ...prev,
      groups: { ...prev.groups, [group]: data }
    }));
  };

  const handleAwardUpdate = (award, value) => {
    setPredictions(prev => ({
      ...prev,
      awards: { ...prev.awards, [award]: value }
    }));
  };

  const allGroups = Object.keys(GROUPS_DATA);

  // Calcular mejores terceros
  const calculateBestThirds = () => {
    const thirds = [];
    
    allGroups.forEach(group => {
      const teams = GROUPS_DATA[group];
      const groupPredictions = predictions.groups[group] || {};
      const matchPredictions = groupPredictions.matches || {};
      
      const table = teams.map(team => ({
        team, group, played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, points: 0
      }));

      const matches = [
        [teams[0], teams[1]], [teams[2], teams[3]],
        [teams[0], teams[2]], [teams[1], teams[3]],
        [teams[0], teams[3]], [teams[1], teams[2]]
      ];

      Object.entries(matchPredictions).forEach(([idx, pred]) => {
        const [home, away] = matches[idx];
        const homeIdx = teams.indexOf(home);
        const awayIdx = teams.indexOf(away);
        
        if (pred.homeScore !== '' && pred.awayScore !== '') {
          const hs = parseInt(pred.homeScore);
          const as = parseInt(pred.awayScore);
          
          table[homeIdx].played++;
          table[awayIdx].played++;
          table[homeIdx].gf += hs;
          table[homeIdx].ga += as;
          table[awayIdx].gf += as;
          table[awayIdx].ga += hs;
          
          if (hs > as) {
            table[homeIdx].won++;
            table[homeIdx].points += 3;
            table[awayIdx].lost++;
          } else if (hs < as) {
            table[awayIdx].won++;
            table[awayIdx].points += 3;
            table[homeIdx].lost++;
          } else {
            table[homeIdx].drawn++;
            table[awayIdx].drawn++;
            table[homeIdx].points++;
            table[awayIdx].points++;
          }
          
          table[homeIdx].gd = table[homeIdx].gf - table[homeIdx].ga;
          table[awayIdx].gd = table[awayIdx].gf - table[awayIdx].ga;
        }
      });

      const sorted = table.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
      if (sorted[2]) thirds.push(sorted[2]);
    });

    return thirds.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf).slice(0, 8);
  };

  const bestThirds = calculateBestThirds();

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
          {/* Header */}
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

          {/* Navigation Tabs */}
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
                {allGroups.map(group => (
                  <GroupCard
                    key={group}
                    group={group}
                    teams={GROUPS_DATA[group]}
                    predictions={predictions.groups}
                    onUpdatePrediction={handleGroupUpdate}
                    expanded={expandedGroups[group]}
                    onToggle={() => toggleGroup(group)}
                  />
                ))}
              </div>

              {bestThirds.length > 0 && (
                <div className="best-thirds-section">
                  <h3>
                    <Trophy size={20} />
                    Mejores Terceros (8 Clasifican)
                  </h3>
                  <div className="best-thirds-table-container">
                    <table className="best-thirds-table">
                      <thead>
                        <tr>
                          <th>POS</th>
                          <th>GRUPO</th>
                          <th>EQUIPO</th>
                          <th>PJ</th>
                          <th>PTS</th>
                          <th>DG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bestThirds.map((row, idx) => (
                          <tr key={idx} className={idx < 8 ? 'qualified-third' : 'eliminated'}>
                            <td>{idx + 1}</td>
                            <td className="group-badge">Grupo {row.group}</td>
                            <td>
                              <div className="team-info">
                                <img 
                                  src={getTeamFlag(row.team)} 
                                  alt={row.team}
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                                <span>{row.team}</span>
                              </div>
                            </td>
                            <td>{row.played}</td>
                            <td className="pts-col">{row.points}</td>
                            <td className={row.gd > 0 ? 'positive' : row.gd < 0 ? 'negative' : ''}>
                              {row.gd > 0 ? '+' : ''}{row.gd}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button className="save-predictions-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}

          {activeTab === 'knockout' && (
            <div className="knockout-section">
              <div className="bracket-info">
                <Trophy size={48} />
                <p>Las eliminatorias se habilitarán una vez finalice la fase de grupos</p>
              </div>
              <button className="save-predictions-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}

          {activeTab === 'awards' && (
            <div className="awards-section">
              <div className="awards-grid">
                {[
                  { icon: Trophy, label: 'Máximo Goleador', key: 'topScorer' },
                  { icon: Target, label: 'Máximo Asistidor', key: 'topAssist' },
                  { icon: TrendingUp, label: 'Selección Sorpresa', key: 'surpriseTeam' },
                  { icon: TrendingDown, label: 'Selección Decepción', key: 'disappointmentTeam' },
                  { icon: Star, label: 'Jugador Revelación', key: 'breakoutPlayer' },
                  { icon: Zap, label: 'Jugador Decepción', key: 'disappointmentPlayer' }
                ].map(award => {
                  const Icon = award.icon;
                  return (
                    <div key={award.key} className="award-card">
                      <div className="award-icon">
                        <Icon size={24} />
                      </div>
                      <label>{award.label}</label>
                      <input
                        type="text"
                        value={predictions.awards[award.key]}
                        onChange={(e) => handleAwardUpdate(award.key, e.target.value)}
                        placeholder={`Nombre...`}
                      />
                    </div>
                  );
                })}
              </div>
              <button className="save-predictions-btn" onClick={handleSave} disabled={saving}>
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
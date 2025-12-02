// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Shield, Plus, Edit2, Trash2, CheckCircle, X,
  Trophy, Target, Award, Calendar, Clock, Users, BarChart3,
  Zap, TrendingUp, Package, Filter, Search, AlertCircle
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import AdminModal from '../components/AdminModal';
import AdminLeagueModal from '../components/AdminLeagueModal';
import AdminAwardModal from '../components/AdminAwardModal';
import AdminAchievementsModal from '../components/AdminAchievementsModal';
import AdminTitlesModal from '../components/AdminTitlesModal';
import FinishLeagueModal from '../components/FinishLeagueModal';
import FinishAwardModal from '../components/FinishAwardModal';
import { ToastContainer, useToast } from '../components/Toast';
import '../styles/AdminPage.css';

export default function AdminPage({ currentUser, onBack }) {
  const [activeSection, setActiveSection] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modales
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showFinishLeagueModal, setShowFinishLeagueModal] = useState(false);
  const [showFinishAwardModal, setShowFinishAwardModal] = useState(false);
  const [itemToFinish, setItemToFinish] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchData, leagueData, awardData, achievementData, titleData] = await Promise.all([
        supabase.from('matches').select('*, predictions(*)'),
        supabase.from('leagues').select('*, league_predictions(*)'),
        supabase.from('awards').select('*, award_predictions(*)'),
        supabase.from('available_achievements').select('*'),
        supabase.from('available_titles').select('*')
      ]);

      setMatches(matchData.data || []);
      setLeagues(leagueData.data || []);
      setAwards(awardData.data || []);
      setAchievements(achievementData.data || []);
      setTitles(titleData.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLERS - MATCHES ==========
  const handleAddMatch = async (match) => {
    try {
      const { error } = await supabase.from('matches').insert(match);
      if (error) throw error;
      await loadData();
      toast.success('¡Partido agregado correctamente!');
      setShowMatchModal(false);
    } catch (err) {
      console.error('Error adding match:', err);
      toast.error('Error al agregar partido');
    }
  };

  const handleFinishMatch = async (matchId) => {
    const homeScore = prompt('Goles equipo local:');
    if (homeScore === null) return;
    const awayScore = prompt('Goles equipo visitante:');
    if (awayScore === null) return;

    try {
      // Actualizar resultado
      await supabase
        .from('matches')
        .update({ 
          result_home: parseInt(homeScore), 
          result_away: parseInt(awayScore), 
          status: 'finished' 
        })
        .eq('id', matchId);

      // Calcular puntos (lógica simplificada - deberías usar tu hook useMatches)
      await loadData();
      toast.success('¡Partido finalizado!');
    } catch (err) {
      console.error('Error finishing match:', err);
      toast.error('Error al finalizar partido');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!confirm('¿Estás seguro de eliminar este partido?')) return;
    
    try {
      const { error } = await supabase.from('matches').delete().eq('id', matchId);
      if (error) throw error;
      await loadData();
      toast.success('Partido eliminado');
    } catch (err) {
      console.error('Error deleting match:', err);
      toast.error('Error al eliminar partido');
    }
  };

  // ========== HANDLERS - LEAGUES ==========
  const handleAddLeague = async (league) => {
    try {
      const { error } = await supabase.from('leagues').insert(league);
      if (error) throw error;
      await loadData();
      toast.success('¡Liga agregada correctamente!');
      setShowLeagueModal(false);
    } catch (err) {
      console.error('Error adding league:', err);
      toast.error('Error al agregar liga');
    }
  };

  const handleFinishLeague = async (leagueId, results) => {
    try {
      await supabase
        .from('leagues')
        .update({ 
          status: 'finished',
          ...results
        })
        .eq('id', leagueId);

      await loadData();
      toast.success('¡Liga finalizada!');
      setShowFinishLeagueModal(false);
      setItemToFinish(null);
    } catch (err) {
      console.error('Error finishing league:', err);
      toast.error('Error al finalizar liga');
    }
  };

  const handleDeleteLeague = async (leagueId) => {
    if (!confirm('¿Estás seguro de eliminar esta liga?')) return;
    
    try {
      const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
      if (error) throw error;
      await loadData();
      toast.success('Liga eliminada');
    } catch (err) {
      console.error('Error deleting league:', err);
      toast.error('Error al eliminar liga');
    }
  };

  // ========== HANDLERS - AWARDS ==========
  const handleAddAward = async (award) => {
    try {
      const { error } = await supabase.from('awards').insert(award);
      if (error) throw error;
      await loadData();
      toast.success('¡Premio agregado correctamente!');
      setShowAwardModal(false);
    } catch (err) {
      console.error('Error adding award:', err);
      toast.error('Error al agregar premio');
    }
  };

  const handleFinishAward = async (awardId, winner) => {
    try {
      await supabase
        .from('awards')
        .update({ status: 'finished', winner })
        .eq('id', awardId);

      await loadData();
      toast.success('¡Premio finalizado!');
      setShowFinishAwardModal(false);
      setItemToFinish(null);
    } catch (err) {
      console.error('Error finishing award:', err);
      toast.error('Error al finalizar premio');
    }
  };

  const handleDeleteAward = async (awardId) => {
    if (!confirm('¿Estás seguro de eliminar este premio?')) return;
    
    try {
      const { error } = await supabase.from('awards').delete().eq('id', awardId);
      if (error) throw error;
      await loadData();
      toast.success('Premio eliminado');
    } catch (err) {
      console.error('Error deleting award:', err);
      toast.error('Error al eliminar premio');
    }
  };

  // ========== HANDLERS - ACHIEVEMENTS & TITLES ==========
  const handleSaveAchievement = async (achievement) => {
    try {
      const { error } = await supabase
        .from('available_achievements')
        .upsert(achievement, { onConflict: 'id' });
      if (error) throw error;
      await loadData();
      toast.success('¡Logro guardado!');
      setShowAchievementModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving achievement:', err);
      toast.error('Error al guardar logro');
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    try {
      const { error } = await supabase
        .from('available_achievements')
        .delete()
        .eq('id', achievementId);
      if (error) throw error;
      await loadData();
      toast.success('Logro eliminado');
      setShowAchievementModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error deleting achievement:', err);
      toast.error('Error al eliminar logro');
    }
  };

  const handleSaveTitle = async (title) => {
    try {
      const { error } = await supabase
        .from('available_titles')
        .upsert(title, { onConflict: 'id' });
      if (error) throw error;
      await loadData();
      toast.success('¡Título guardado!');
      setShowTitleModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving title:', err);
      toast.error('Error al guardar título');
    }
  };

  const handleDeleteTitle = async (titleId) => {
    try {
      const { error } = await supabase
        .from('available_titles')
        .delete()
        .eq('id', titleId);
      if (error) throw error;
      await loadData();
      toast.success('Título eliminado');
      setShowTitleModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error deleting title:', err);
      toast.error('Error al eliminar título');
    }
  };

  // ========== FILTERS ==========
  const getFilteredItems = () => {
    let items = [];
    
    switch(activeSection) {
      case 'matches':
        items = matches;
        break;
      case 'leagues':
        items = leagues;
        break;
      case 'awards':
        items = awards;
        break;
      case 'achievements':
        items = achievements;
        break;
      case 'titles':
        items = titles;
        break;
      default:
        items = [];
    }

    // Filtro de búsqueda
    if (searchTerm) {
      items = items.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de estado (solo para matches, leagues, awards)
    if (filterStatus !== 'all' && ['matches', 'leagues', 'awards'].includes(activeSection)) {
      items = items.filter(item => item.status === filterStatus);
    }

    return items;
  };

  // ========== STATS ==========
  const stats = {
    matches: {
      total: matches.length,
      pending: matches.filter(m => m.status === 'pending').length,
      finished: matches.filter(m => m.status === 'finished').length
    },
    leagues: {
      total: leagues.length,
      active: leagues.filter(l => l.status === 'active').length,
      finished: leagues.filter(l => l.status === 'finished').length
    },
    awards: {
      total: awards.length,
      active: awards.filter(a => a.status === 'active').length,
      finished: awards.filter(a => a.status === 'finished').length
    },
    achievements: {
      total: achievements.length
    },
    titles: {
      total: titles.length
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner-large"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          <h1 className="admin-page-title">
            <Shield size={36} />
            Panel de Administración
          </h1>
        </div>

        <div className="admin-page-container">
          {/* Stats Overview */}
          <div className="admin-stats-overview">
            <div className="admin-stat-card matches">
              <div className="stat-icon-wrapper">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Partidos</div>
                <div className="stat-value">{stats.matches.total}</div>
                <div className="stat-detail">
                  {stats.matches.pending} pendientes
                </div>
              </div>
            </div>

            <div className="admin-stat-card leagues">
              <div className="stat-icon-wrapper">
                <Trophy size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Ligas</div>
                <div className="stat-value">{stats.leagues.total}</div>
                <div className="stat-detail">
                  {stats.leagues.active} activas
                </div>
              </div>
            </div>

            <div className="admin-stat-card awards">
              <div className="stat-icon-wrapper">
                <Award size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Premios</div>
                <div className="stat-value">{stats.awards.total}</div>
                <div className="stat-detail">
                  {stats.awards.active} activos
                </div>
              </div>
            </div>

            <div className="admin-stat-card system">
              <div className="stat-icon-wrapper">
                <Package size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Sistema</div>
                <div className="stat-value">
                  {stats.achievements.total + stats.titles.total}
                </div>
                <div className="stat-detail">
                  logros y títulos
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="admin-nav-tabs">
            <button 
              className={`admin-nav-tab ${activeSection === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveSection('matches')}
            >
              <Target size={20} />
              <span>Partidos</span>
              {stats.matches.pending > 0 && (
                <span className="tab-badge">{stats.matches.pending}</span>
              )}
            </button>

            <button 
              className={`admin-nav-tab ${activeSection === 'leagues' ? 'active' : ''}`}
              onClick={() => setActiveSection('leagues')}
            >
              <Trophy size={20} />
              <span>Ligas</span>
              {stats.leagues.active > 0 && (
                <span className="tab-badge">{stats.leagues.active}</span>
              )}
            </button>

            <button 
              className={`admin-nav-tab ${activeSection === 'awards' ? 'active' : ''}`}
              onClick={() => setActiveSection('awards')}
            >
              <Award size={20} />
              <span>Premios</span>
              {stats.awards.active > 0 && (
                <span className="tab-badge">{stats.awards.active}</span>
              )}
            </button>

            <button 
              className={`admin-nav-tab ${activeSection === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveSection('achievements')}
            >
              <Zap size={20} />
              <span>Logros</span>
            </button>

            <button 
              className={`admin-nav-tab ${activeSection === 'titles' ? 'active' : ''}`}
              onClick={() => setActiveSection('titles')}
            >
              <Package size={20} />
              <span>Títulos</span>
            </button>
          </div>

          {/* Controls */}
          <div className="admin-controls">
            <div className="search-filter-group">
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder={`Buscar ${activeSection}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {['matches', 'leagues', 'awards'].includes(activeSection) && (
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                  >
                    Todos
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'pending' || filterStatus === 'active' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(activeSection === 'matches' ? 'pending' : 'active')}
                  >
                    Activos
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'finished' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('finished')}
                  >
                    Finalizados
                  </button>
                </div>
              )}
            </div>

            <button 
              className="add-new-btn"
              onClick={() => {
                if (activeSection === 'matches') setShowMatchModal(true);
                if (activeSection === 'leagues') setShowLeagueModal(true);
                if (activeSection === 'awards') setShowAwardModal(true);
                if (activeSection === 'achievements') setShowAchievementModal(true);
                if (activeSection === 'titles') setShowTitleModal(true);
              }}
            >
              <Plus size={20} />
              <span>Agregar Nuevo</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="admin-content-area">
            {activeSection === 'matches' && (
              <div className="admin-items-grid">
                {getFilteredItems().map(match => (
                  <div key={match.id} className="admin-item-card match">
                    <div className="item-header">
                      <div className="item-info">
                        <div className="item-league">{match.league}</div>
                        <div className="item-teams">
                          {match.home_team_logo} {match.home_team} vs {match.away_team} {match.away_team_logo}
                        </div>
                        <div className="item-meta">
                          <Calendar size={14} />
                          <span>{match.date}</span>
                          <Clock size={14} />
                          <span>{match.time}</span>
                        </div>
                      </div>
                      <div className={`item-status ${match.status}`}>
                        {match.status === 'pending' ? 'Pendiente' : 'Finalizado'}
                      </div>
                    </div>
                    <div className="item-actions">
                      {match.status === 'pending' && (
                        <button 
                          className="action-btn finish"
                          onClick={() => handleFinishMatch(match.id)}
                        >
                          <CheckCircle size={16} />
                          <span>Finalizar</span>
                        </button>
                      )}
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteMatch(match.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'leagues' && (
              <div className="admin-items-grid">
                {getFilteredItems().map(league => (
                  <div key={league.id} className="admin-item-card league">
                    <div className="item-header">
                      <div className="item-info">
                        <div className="item-title">
                          {league.logo} {league.name}
                        </div>
                        <div className="item-subtitle">{league.season}</div>
                      </div>
                      <div className={`item-status ${league.status}`}>
                        {league.status === 'active' ? 'Activa' : 'Finalizada'}
                      </div>
                    </div>
                    <div className="item-actions">
                      {league.status === 'active' && (
                        <button 
                          className="action-btn finish"
                          onClick={() => {
                            setItemToFinish(league);
                            setShowFinishLeagueModal(true);
                          }}
                        >
                          <CheckCircle size={16} />
                          <span>Finalizar</span>
                        </button>
                      )}
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteLeague(league.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'awards' && (
              <div className="admin-items-grid">
                {getFilteredItems().map(award => (
                  <div key={award.id} className="admin-item-card award">
                    <div className="item-header">
                      <div className="item-info">
                        <div className="item-title">
                          {award.logo} {award.name}
                        </div>
                        <div className="item-subtitle">{award.season}</div>
                      </div>
                      <div className={`item-status ${award.status}`}>
                        {award.status === 'active' ? 'Activo' : 'Finalizado'}
                      </div>
                    </div>
                    <div className="item-actions">
                      {award.status === 'active' && (
                        <button 
                          className="action-btn finish"
                          onClick={() => {
                            setItemToFinish(award);
                            setShowFinishAwardModal(true);
                          }}
                        >
                          <CheckCircle size={16} />
                          <span>Finalizar</span>
                        </button>
                      )}
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteAward(award.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'achievements' && (
              <div className="admin-items-grid">
                {getFilteredItems().map(achievement => (
                  <div key={achievement.id} className="admin-item-card achievement">
                    <div className="item-header">
                      <div className="item-info">
                        <div className="item-title">
                          {achievement.icon} {achievement.name}
                        </div>
                        <div className="item-subtitle">{achievement.description}</div>
                        <div className="item-meta">
                          <span className="category-badge">{achievement.category}</span>
                          <span>{achievement.requirement_value} {achievement.requirement_type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => {
                          setEditingItem(achievement);
                          setShowAchievementModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteAchievement(achievement.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'titles' && (
              <div className="admin-items-grid">
                {getFilteredItems().map(title => (
                  <div key={title.id} className="admin-item-card title">
                    <div className="item-header">
                      <div className="item-info">
                        <div className="item-title" style={{ color: title.color }}>
                          {title.name}
                        </div>
                        <div className="item-subtitle">{title.description}</div>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => {
                          setEditingItem(title);
                          setShowTitleModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteTitle(title.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {getFilteredItems().length === 0 && (
              <div className="admin-empty-state">
                <AlertCircle size={48} />
                <p>No hay {activeSection} para mostrar</p>
                <button 
                  className="add-new-btn"
                  onClick={() => {
                    if (activeSection === 'matches') setShowMatchModal(true);
                    if (activeSection === 'leagues') setShowLeagueModal(true);
                    if (activeSection === 'awards') setShowAwardModal(true);
                    if (activeSection === 'achievements') setShowAchievementModal(true);
                    if (activeSection === 'titles') setShowTitleModal(true);
                  }}
                >
                  <Plus size={20} />
                  <span>Agregar Nuevo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showMatchModal && (
        <AdminModal 
          onAdd={handleAddMatch} 
          onClose={() => setShowMatchModal(false)} 
        />
      )}

      {showLeagueModal && (
        <AdminLeagueModal 
          onAdd={handleAddLeague} 
          onClose={() => setShowLeagueModal(false)} 
        />
      )}

      {showAwardModal && (
        <AdminAwardModal 
          onAdd={handleAddAward}
          onClose={() => setShowAwardModal(false)}
        />
      )}

      {showAchievementModal && (
        <AdminAchievementsModal
          onClose={() => {
            setShowAchievementModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveAchievement}
          onDelete={handleDeleteAchievement}
          existingAchievement={editingItem}
        />
      )}

      {showTitleModal && (
        <AdminTitlesModal
          onClose={() => {
            setShowTitleModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveTitle}
          onDelete={handleDeleteTitle}
          existingTitle={editingItem}
        />
      )}

      {showFinishLeagueModal && itemToFinish && (
        <FinishLeagueModal 
          league={itemToFinish}
          onFinish={handleFinishLeague}
          onClose={() => {
            setShowFinishLeagueModal(false);
            setItemToFinish(null);
          }}
        />
      )}

      {showFinishAwardModal && itemToFinish && (
        <FinishAwardModal
          award={itemToFinish}
          onFinish={handleFinishAward}
          onClose={() => {
            setShowFinishAwardModal(false);
            setItemToFinish(null);
          }}
        />
      )}

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}
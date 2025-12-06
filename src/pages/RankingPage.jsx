// src/pages/RankingPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Trophy, Medal, Crown, TrendingUp, Target, 
  Flame, Award, Star, Users, BarChart3, Zap, Shield,
  ChevronUp, ChevronDown, Minus, Filter, Search, Sparkles
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import '../styles/RankingPage.css';

export default function RankingPage({ currentUser, onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('points');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas globales
  const globalStats = {
    totalUsers: users.length,
    totalPredictions: users.reduce((sum, u) => sum + (u.predictions || 0), 0),
    totalPoints: users.reduce((sum, u) => sum + (u.points || 0), 0),
    avgAccuracy: users.length > 0 
      ? Math.round(users.reduce((sum, u) => {
          const acc = u.predictions > 0 ? (u.correct / u.predictions) * 100 : 0;
          return sum + acc;
        }, 0) / users.length)
      : 0
  };

  // Encontrar posición del usuario actual
  const currentUserPosition = users.findIndex(u => u.id === currentUser?.id) + 1;
  const currentUserData = users.find(u => u.id === currentUser?.id);

  // Filtrar y ordenar usuarios
  const getFilteredUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === 'top10') {
      filtered = filtered.slice(0, 10);
    }

    if (sortBy === 'accuracy') {
      filtered.sort((a, b) => {
        const accA = a.predictions > 0 ? (a.correct / a.predictions) : 0;
        const accB = b.predictions > 0 ? (b.correct / b.predictions) : 0;
        return accB - accA;
      });
    } else if (sortBy === 'predictions') {
      filtered.sort((a, b) => b.predictions - a.predictions);
    } else {
      filtered.sort((a, b) => b.points - a.points);
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Helper para obtener icono de posición
  const getRankIcon = (position) => {
    if (position === 1) return <Crown size={18} className="rank-icon gold" />;
    if (position === 2) return <Medal size={18} className="rank-icon silver" />;
    if (position === 3) return <Medal size={18} className="rank-icon bronze" />;
    return null;
  };

  if (loading) {
    return (
      <div className="ranking-page-loading">
        <div className="loader-container">
          <div className="spinner-premium"></div>
          <Sparkles className="loader-icon" size={32} />
        </div>
        <p className="loading-text">Cargando ranking...</p>
      </div>
    );
  }

  return (
    <div className="ranking-page">
      {/* Animated Background Elements */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="ranking-page-container">
                {/* Tu Posición - Modernizado */}
        {currentUserData && (
          <div className="your-rank-modern">
            <div className="your-rank-content">
              <div className="rank-badge-modern">
                <div className="badge-inner">
                  <Shield className="badge-icon" size={24} />
                  <div className="badge-position">
                    <span className="position-hash">#</span>
                    <span className="position-num">{currentUserPosition}</span>
                  </div>
                  <div className="badge-total">de {users.length}</div>
                </div>
              </div>
              
              <div className="rank-stats-modern">
                <div className="rank-stat-item">
                  <div className="stat-icon-circle points-circle">
                    <Zap size={18} />
                  </div>
                  <div className="stat-text">
                    <div className="stat-num">{currentUserData.points}</div>
                    <div className="stat-lab">Puntos</div>
                  </div>
                </div>

                <div className="stat-divider-modern"></div>

                <div className="rank-stat-item">
                  <div className="stat-icon-circle accuracy-circle">
                    <Target size={18} />
                  </div>
                  <div className="stat-text">
                    <div className="stat-num">
                      {currentUserData.predictions > 0 
                        ? Math.round((currentUserData.correct / currentUserData.predictions) * 100) 
                        : 0}%
                    </div>
                    <div className="stat-lab">Precisión</div>
                  </div>
                </div>

                <div className="stat-divider-modern"></div>

                <div className="rank-stat-item">
                  <div className="stat-icon-circle predictions-circle">
                    <Flame size={18} />
                  </div>
                  <div className="stat-text">
                    <div className="stat-num">{currentUserData.predictions}</div>
                    <div className="stat-lab">Predicciones</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="your-rank-shine"></div>
          </div>
        )}

        {/* Stats Cards Grid */}
        <div className="stats-grid-modern">
          <div className="stat-card-modern">
            <div className="stat-card-inner">
              <div className="stat-icon-modern users-gradient">
                <Users size={24} />
              </div>
              <div className="stat-data">
                <div className="stat-value-modern">{globalStats.totalUsers}</div>
                <div className="stat-label-modern">Usuarios</div>
              </div>
            </div>
            <div className="stat-card-glow users-glow"></div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-card-inner">
              <div className="stat-icon-modern predictions-gradient">
                <Target size={24} />
              </div>
              <div className="stat-data">
                <div className="stat-value-modern">{globalStats.totalPredictions}</div>
                <div className="stat-label-modern">Predics</div>
              </div>
            </div>
            <div className="stat-card-glow predictions-glow"></div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-card-inner">
              <div className="stat-icon-modern points-gradient">
                <Zap size={24} />
              </div>
              <div className="stat-data">
                <div className="stat-value-modern">{globalStats.totalPoints}</div>
                <div className="stat-label-modern">Puntos Totales</div>
              </div>
            </div>
            <div className="stat-card-glow points-glow"></div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-card-inner">
              <div className="stat-icon-modern accuracy-gradient">
                <BarChart3 size={24} />
              </div>
              <div className="stat-data">
                <div className="stat-value-modern">{globalStats.avgAccuracy}%</div>
                <div className="stat-label-modern">Precisión Media</div>
              </div>
            </div>
            <div className="stat-card-glow accuracy-glow"></div>
          </div>
        </div>

      {/* PODIO TOP 3 - Ultra Mejorado */}
        {users.length >= 3 && (
          <div className="podium-ultra">
            <div className="podium-header-ultra">
              <Award className="podium-icon-ultra" size={32} />
              <h2 className="podium-title-ultra">Hall of Champions</h2>
              <Sparkles className="podium-sparkle" size={24} />
            </div>
            
            <div className="podium-stage">
              {/* 2do Lugar */}
              <div className="podium-player second-place">
                <div className="place-medal silver-medal">
                  <Medal size={28} />
                  <span className="medal-rank">2</span>
                </div>
                
                <div className="player-card silver-card">
                  <div className="card-shine"></div>
                  
                  <div className="player-avatar-wrap">
                    <div className="avatar-rings silver-rings">
                      <div className="ring ring-1"></div>
                      <div className="ring ring-2"></div>
                    </div>
                    <div className="player-avatar-ultra">
                      {users[1].avatar_url ? (
                        <img src={users[1].avatar_url} alt={users[1].name} />
                      ) : (
                        <span>{users[1].name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="player-name-ultra">{users[1].name}</div>
                  
                  <div className="player-stats-ultra">
                    <div className="stat-ultra">
                      <Zap size={14} className="stat-icon-color points-color" />
                      <span className="stat-value-ultra">{users[1].points}</span>
                    </div>
                    <div className="stat-separator"></div>
                    <div className="stat-ultra">
                      <Target size={14} className="stat-icon-color accuracy-color" />
                      <span className="stat-value-ultra">
                        {users[1].predictions > 0 
                          ? Math.round((users[1].correct / users[1].predictions) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="place-height place-2"></div>
              </div>

              {/* 1er Lugar */}
              <div className="podium-player first-place">
                <div className="champion-crown">
                  <Crown size={36} />
                  <Star className="crown-star star-1" size={14} />
                  <Star className="crown-star star-2" size={12} />
                  <Star className="crown-star star-3" size={10} />
                </div>
                
                <div className="player-card gold-card">
                  <div className="card-shine gold-shine"></div>
                  
                  <div className="player-avatar-wrap">
                    <div className="avatar-rings gold-rings">
                      <div className="ring ring-1"></div>
                      <div className="ring ring-2"></div>
                      <div className="ring ring-3"></div>
                    </div>
                    <div className="player-avatar-ultra champion-avatar">
                      {users[0].avatar_url ? (
                        <img src={users[0].avatar_url} alt={users[0].name} />
                      ) : (
                        <span>{users[0].name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <Sparkles className="avatar-sparkle sparkle-1" size={16} />
                    <Sparkles className="avatar-sparkle sparkle-2" size={12} />
                  </div>
                  
                  <div className="player-name-ultra champion-name">{users[0].name}</div>
                  
                  <div className="player-stats-ultra">
                    <div className="stat-ultra">
                      <Zap size={16} className="stat-icon-color points-color" />
                      <span className="stat-value-ultra champion-stat">{users[0].points}</span>
                    </div>
                    <div className="stat-separator"></div>
                    <div className="stat-ultra">
                      <Target size={16} className="stat-icon-color accuracy-color" />
                      <span className="stat-value-ultra champion-stat">
                        {users[0].predictions > 0 
                          ? Math.round((users[0].correct / users[0].predictions) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="place-height place-1"></div>
              </div>

              {/* 3er Lugar */}
              <div className="podium-player third-place">
                <div className="place-medal bronze-medal">
                  <Medal size={28} />
                  <span className="medal-rank">3</span>
                </div>
                
                <div className="player-card bronze-card">
                  <div className="card-shine"></div>
                  
                  <div className="player-avatar-wrap">
                    <div className="avatar-rings bronze-rings">
                      <div className="ring ring-1"></div>
                      <div className="ring ring-2"></div>
                    </div>
                    <div className="player-avatar-ultra">
                      {users[2].avatar_url ? (
                        <img src={users[2].avatar_url} alt={users[2].name} />
                      ) : (
                        <span>{users[2].name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="player-name-ultra">{users[2].name}</div>
                  
                  <div className="player-stats-ultra">
                    <div className="stat-ultra">
                      <Zap size={14} className="stat-icon-color points-color" />
                      <span className="stat-value-ultra">{users[2].points}</span>
                    </div>
                    <div className="stat-separator"></div>
                    <div className="stat-ultra">
                      <Target size={14} className="stat-icon-color accuracy-color" />
                      <span className="stat-value-ultra">
                        {users[2].predictions > 0 
                          ? Math.round((users[2].correct / users[2].predictions) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="place-height place-3"></div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="controls-modern">
          <div className="search-modern">
            <Search size={20} className="search-icon-modern" />
            <input
              type="text"
              placeholder="Buscar competidor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-modern"
            />
          </div>

          <div className="filters-modern">
            <button 
              className={`filter-modern ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              <Users size={16} />
              <span>Todos</span>
            </button>
            <button 
              className={`filter-modern ${filterType === 'top10' ? 'active' : ''}`}
              onClick={() => setFilterType('top10')}
            >
              <Trophy size={16} />
              <span>Top 10</span>
            </button>
          </div>

          <div className="sorts-modern">
            <button 
              className={`sort-modern ${sortBy === 'points' ? 'active' : ''}`}
              onClick={() => setSortBy('points')}
            >
              <Zap size={16} />
              <span>Puntos</span>
            </button>
            <button 
              className={`sort-modern ${sortBy === 'accuracy' ? 'active' : ''}`}
              onClick={() => setSortBy('accuracy')}
            >
              <Target size={16} />
              <span>Precisión</span>
            </button>
            <button 
              className={`sort-modern ${sortBy === 'predictions' ? 'active' : ''}`}
              onClick={() => setSortBy('predictions')}
            >
              <BarChart3 size={16} />
              <span>Actividad</span>
            </button>
          </div>
        </div>

        {/* Ranking List - Modernizado */}
        <div className="ranking-list-modern">
          <div className="list-header-modern">
            <div className="header-cell pos-cell">Pos</div>
            <div className="header-cell user-cell">Usuario</div>
            <div className="header-cell points-cell">Puntos</div>
            <div className="header-cell preds-cell">Predicciones</div>
            <div className="header-cell acc-cell">Precisión</div>
          </div>

          <div className="list-body-modern">
            {filteredUsers.map((user, index) => {
              const position = users.findIndex(u => u.id === user.id) + 1;
              const accuracy = user.predictions > 0 
                ? Math.round((user.correct / user.predictions) * 100) 
                : 0;
              const isCurrentUser = user.id === currentUser?.id;

              return (
                <div 
                  key={user.id} 
                  className={`list-row-modern ${isCurrentUser ? 'is-current' : ''} ${position <= 3 ? 'is-podium' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="row-cell pos-cell">
                    <div className="position-display">
                      {getRankIcon(position)}
                      <span className={`pos-number ${position <= 3 ? 'top-three' : ''}`}>
                        #{position}
                      </span>
                    </div>
                  </div>

                  <div className="row-cell user-cell">
                    <div className="user-display">
                      <div className="user-avatar-small">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} />
                        ) : (
                          <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="user-info-small">
                        <div className="user-name-small">
                          {user.name}
                          {isCurrentUser && <span className="you-tag">Tú</span>}
                        </div>
                        <div className="user-correct-small">{user.correct} aciertos</div>
                      </div>
                    </div>
                  </div>

                  <div className="row-cell points-cell">
                    <div className="points-display">
                      <Zap size={16} className="points-icon-small" />
                      <span className="points-num">{user.points}</span>
                    </div>
                  </div>

                  <div className="row-cell preds-cell">
                    <span className="preds-num">{user.predictions}</span>
                  </div>

                  <div className="row-cell acc-cell">
                    <div className="accuracy-display">
                      <div className="acc-bar-modern">
                        <div 
                          className="acc-fill-modern" 
                          style={{ width: `${accuracy}%` }}
                        ></div>
                      </div>
                      <span className="acc-percent">{accuracy}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="no-results-modern">
            <div className="no-results-icon">
              <Search size={64} />
            </div>
            <p className="no-results-text">No se encontraron resultados</p>
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
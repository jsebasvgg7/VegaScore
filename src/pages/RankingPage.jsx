// src/pages/RankingPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Trophy, Medal, Crown, TrendingUp, Target, 
  Flame, Award, Star, Users, BarChart3, Zap, Shield,
  ChevronUp, ChevronDown, Minus, Filter, Search
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Header from '../components/Header';
import '../styles/RankingPage.css';

export default function RankingPage({ currentUser, users, onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, top10, friends
  const [sortBy, setSortBy] = useState('points'); // points, accuracy, predictions

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

    // Búsqueda
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros
    if (filterType === 'top10') {
      filtered = filtered.slice(0, 10);
    }

    // Ordenamiento
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
    if (position === 1) return <Crown size={24} className="rank-icon gold" />;
    if (position === 2) return <Medal size={24} className="rank-icon silver" />;
    if (position === 3) return <Medal size={24} className="rank-icon bronze" />;
    return null;
  };

  // Helper para calcular diferencia con posición anterior
  const getPositionChange = (position) => {
    // Simulado - podrías guardar histórico en BD
    const change = Math.floor(Math.random() * 5) - 2;
    if (change > 0) return <ChevronUp size={16} className="position-up" />;
    if (change < 0) return <ChevronDown size={16} className="position-down" />;
    return <Minus size={16} className="position-same" />;
  };

  if (loading) {
    return (
      <div className="ranking-page-loading">
        <div className="spinner-large"></div>
        <p>Cargando ranking...</p>
      </div>
    );
  }

  return (
    <div className="ranking-page">
      {/* Header */}
      <div className="ranking-page-header">
        <h1 className="ranking-page-title">
          <Trophy size={36} />
          Ranking Global
        </h1>
      </div>

      <div className="ranking-page-container">
        {/* Stats Cards */}
        <div className="ranking-stats-grid">
          <div className="ranking-stat-card">
            <div className="stat-icon-wrapper users">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Competidores</div>
              <div className="stat-value">{globalStats.totalUsers}</div>
            </div>
          </div>

          <div className="ranking-stat-card">
            <div className="stat-icon-wrapper predictions">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Predicciones Totales</div>
              <div className="stat-value">{globalStats.totalPredictions}</div>
            </div>
          </div>

          <div className="ranking-stat-card">
            <div className="stat-icon-wrapper points">
              <Zap size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Puntos Distribuidos</div>
              <div className="stat-value">{globalStats.totalPoints}</div>
            </div>
          </div>

          <div className="ranking-stat-card">
            <div className="stat-icon-wrapper accuracy">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Precisión Promedio</div>
              <div className="stat-value">{globalStats.avgAccuracy}%</div>
            </div>
          </div>
        </div>

        {/* Tu Posición Card */}
        {currentUserData && (
          <div className="your-position-card">
            <div className="your-position-header">
              <Shield size={24} />
              <h2>Tu Posición</h2>
            </div>
            <div className="your-position-content">
              <div className="position-badge">
                <span className="position-number">#{currentUserPosition}</span>
                <span className="position-label">de {users.length}</span>
              </div>
              <div className="position-stats">
                <div className="position-stat">
                  <Zap size={18} />
                  <div>
                    <div className="position-stat-value">{currentUserData.points}</div>
                    <div className="position-stat-label">Puntos</div>
                  </div>
                </div>
                <div className="position-stat">
                  <Target size={18} />
                  <div>
                    <div className="position-stat-value">
                      {currentUserData.predictions > 0 
                        ? Math.round((currentUserData.correct / currentUserData.predictions) * 100) 
                        : 0}%
                    </div>
                    <div className="position-stat-label">Precisión</div>
                  </div>
                </div>
                <div className="position-stat">
                  <Flame size={18} />
                  <div>
                    <div className="position-stat-value">{currentUserData.predictions}</div>
                    <div className="position-stat-label">Predicciones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="ranking-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              <Users size={16} />
              Todos
            </button>
            <button 
              className={`filter-btn ${filterType === 'top10' ? 'active' : ''}`}
              onClick={() => setFilterType('top10')}
            >
              <Trophy size={16} />
              Top 10
            </button>
          </div>

          <div className="sort-buttons">
            <button 
              className={`sort-btn ${sortBy === 'points' ? 'active' : ''}`}
              onClick={() => setSortBy('points')}
            >
              <Zap size={16} />
              Puntos
            </button>
            <button 
              className={`sort-btn ${sortBy === 'accuracy' ? 'active' : ''}`}
              onClick={() => setSortBy('accuracy')}
            >
              <Target size={16} />
              Precisión
            </button>
            <button 
              className={`sort-btn ${sortBy === 'predictions' ? 'active' : ''}`}
              onClick={() => setSortBy('predictions')}
            >
              <BarChart3 size={16} />
              Actividad
            </button>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="ranking-table-container">
          <div className="ranking-table-header">
            <div className="table-header-cell position">Pos.</div>
            <div className="table-header-cell user">Usuario</div>
            <div className="table-header-cell points">Puntos</div>
            <div className="table-header-cell predictions">Predicciones</div>
            <div className="table-header-cell accuracy">Precisión</div>
            <div className="table-header-cell trend">Tendencia</div>
          </div>

          <div className="ranking-table-body">
            {filteredUsers.map((user, index) => {
              const position = users.findIndex(u => u.id === user.id) + 1;
              const accuracy = user.predictions > 0 
                ? Math.round((user.correct / user.predictions) * 100) 
                : 0;
              const isCurrentUser = user.id === currentUser?.id;

              return (
                <div 
                  key={user.id} 
                  className={`ranking-table-row ${isCurrentUser ? 'current-user' : ''} ${position <= 3 ? 'podium' : ''}`}
                >
                  <div className="table-cell position">
                    <div className="position-wrapper">
                      {getRankIcon(position)}
                      <span className={`position-number ${position <= 3 ? 'highlight' : ''}`}>
                        {position}
                      </span>
                    </div>
                  </div>

                  <div className="table-cell user">
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} />
                        ) : (
                          <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {user.name}
                          {isCurrentUser && <span className="you-badge">Tú</span>}
                        </div>
                        <div className="user-stats-mini">
                          {user.correct} aciertos
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="table-cell points">
                    <div className="points-cell">
                      <Zap size={16} />
                      <span className="points-value">{user.points}</span>
                    </div>
                  </div>

                  <div className="table-cell predictions">
                    <span className="predictions-value">{user.predictions}</span>
                  </div>

                  <div className="table-cell accuracy">
                    <div className="accuracy-cell">
                      <div className="accuracy-bar">
                        <div 
                          className="accuracy-fill" 
                          style={{ width: `${accuracy}%` }}
                        ></div>
                      </div>
                      <span className="accuracy-value">{accuracy}%</span>
                    </div>
                  </div>

                  <div className="table-cell trend">
                    {getPositionChange(position)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <Search size={48} />
            <p>No se encontraron resultados</p>
            <button onClick={() => setSearchTerm('')}>Limpiar búsqueda</button>
          </div>
        )}
      </div>
    </div>
  );
}
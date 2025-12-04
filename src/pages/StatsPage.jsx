// src/pages/StatsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Target, Flame, Trophy, Award,
  Calendar, Clock, Percent, CheckCircle2, XCircle, Activity,
  Zap, Users, ChevronRight, TrendingDown, Minus, Star
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import '../styles/StatsPage.css';

export default function StatsPage({ currentUser }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, month, week

  useEffect(() => {
    if (currentUser) {
      loadStats();
    }
  }, [currentUser, timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Calcular fecha límite según timeRange
      const now = new Date();
      let dateLimit = null;
      if (timeRange === 'week') {
        dateLimit = new Date(now.setDate(now.getDate() - 7)).toISOString();
      } else if (timeRange === 'month') {
        dateLimit = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      }

      // Cargar predicciones de partidos
      let matchQuery = supabase
        .from('predictions')
        .select(`
          *,
          matches (
            id,
            league,
            home_team,
            away_team,
            result_home,
            result_away,
            status,
            date
          )
        `)
        .eq('user_id', currentUser.id);

      if (dateLimit) {
        matchQuery = matchQuery.gte('created_at', dateLimit);
      }

      const { data: predictions } = await matchQuery;

      // Cargar predicciones de ligas
      const { data: leaguePredictions } = await supabase
        .from('league_predictions')
        .select('*, leagues(*)')
        .eq('user_id', currentUser.id);

      // Cargar predicciones de premios
      const { data: awardPredictions } = await supabase
        .from('award_predictions')
        .select('*, awards(*)')
        .eq('user_id', currentUser.id);

      // Procesar estadísticas
      const processedStats = processStats(predictions || [], leaguePredictions || [], awardPredictions || []);
      setStats(processedStats);

    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (predictions, leaguePreds, awardPreds) => {
    // Filtrar predicciones finalizadas
    const finishedPredictions = predictions.filter(p => p.matches?.status === 'finished');
    
    // Calcular resultados
    let exact = 0;
    let correctResult = 0;
    let wrong = 0;
    let totalPoints = 0;

    finishedPredictions.forEach(pred => {
      const match = pred.matches;
      const predDiff = Math.sign(pred.home_score - pred.away_score);
      const resultDiff = Math.sign(match.result_home - match.result_away);

      if (pred.home_score === match.result_home && pred.away_score === match.result_away) {
        exact++;
        totalPoints += 5;
      } else if (predDiff === resultDiff) {
        correctResult++;
        totalPoints += 3;
      } else {
        wrong++;
      }
    });

    // Estadísticas por liga
    const leagueStats = {};
    finishedPredictions.forEach(pred => {
      const league = pred.matches?.league;
      if (!league) return;

      if (!leagueStats[league]) {
        leagueStats[league] = { total: 0, correct: 0, exact: 0, points: 0 };
      }

      leagueStats[league].total++;
      const match = pred.matches;
      const predDiff = Math.sign(pred.home_score - pred.away_score);
      const resultDiff = Math.sign(match.result_home - match.result_away);

      if (pred.home_score === match.result_home && pred.away_score === match.result_away) {
        leagueStats[league].exact++;
        leagueStats[league].correct++;
        leagueStats[league].points += 5;
      } else if (predDiff === resultDiff) {
        leagueStats[league].correct++;
        leagueStats[league].points += 3;
      }
    });

    // Calcular rachas
    const sortedPredictions = [...finishedPredictions].sort((a, b) => 
      new Date(b.matches.date) - new Date(a.matches.date)
    );

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    sortedPredictions.forEach((pred, index) => {
      const match = pred.matches;
      const predDiff = Math.sign(pred.home_score - pred.away_score);
      const resultDiff = Math.sign(match.result_home - match.result_away);
      const isCorrect = predDiff === resultDiff || 
        (pred.home_score === match.result_home && pred.away_score === match.result_away);

      if (isCorrect) {
        tempStreak++;
        if (index === 0) currentStreak = tempStreak;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
        if (index === 0) currentStreak = 0;
      }
    });

    // Predicciones por día de la semana
    const dayStats = {
      0: { name: 'Dom', correct: 0, total: 0 },
      1: { name: 'Lun', correct: 0, total: 0 },
      2: { name: 'Mar', correct: 0, total: 0 },
      3: { name: 'Mié', correct: 0, total: 0 },
      4: { name: 'Jue', correct: 0, total: 0 },
      5: { name: 'Vie', correct: 0, total: 0 },
      6: { name: 'Sáb', correct: 0, total: 0 }
    };

    finishedPredictions.forEach(pred => {
      const day = new Date(pred.matches.date).getDay();
      dayStats[day].total++;
      
      const match = pred.matches;
      const predDiff = Math.sign(pred.home_score - pred.away_score);
      const resultDiff = Math.sign(match.result_home - match.result_away);
      
      if (predDiff === resultDiff || 
        (pred.home_score === match.result_home && pred.away_score === match.result_away)) {
        dayStats[day].correct++;
      }
    });

    // Estadísticas de ligas y premios
    const finishedLeagues = leaguePreds.filter(lp => lp.leagues?.status === 'finished');
    const finishedAwards = awardPreds.filter(ap => ap.awards?.status === 'finished');

    const leaguePoints = finishedLeagues.reduce((sum, lp) => sum + (lp.points_earned || 0), 0);
    const awardPoints = finishedAwards.reduce((sum, ap) => sum + (ap.points_earned || 0), 0);

    return {
      // Generales
      totalPredictions: finishedPredictions.length,
      pendingPredictions: predictions.length - finishedPredictions.length,
      exact,
      correctResult,
      wrong,
      totalPoints,
      accuracy: finishedPredictions.length > 0 
        ? Math.round(((exact + correctResult) / finishedPredictions.length) * 100) 
        : 0,
      exactAccuracy: finishedPredictions.length > 0 
        ? Math.round((exact / finishedPredictions.length) * 100) 
        : 0,

      // Rachas
      currentStreak,
      bestStreak,

      // Por liga
      leagueStats: Object.entries(leagueStats)
        .map(([name, stats]) => ({
          name,
          ...stats,
          accuracy: Math.round((stats.correct / stats.total) * 100)
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 5),

      // Por día
      dayStats: Object.values(dayStats),

      // Ligas y premios
      leaguePredictions: leaguePreds.length,
      awardPredictions: awardPreds.length,
      leaguePoints,
      awardPoints,

      // Distribución de puntos
      pointsFromMatches: totalPoints,
      pointsFromLeagues: leaguePoints,
      pointsFromAwards: awardPoints
    };
  };

  if (loading) {
    return (
      <div className="stats-page-loading">
        <Activity size={48} className="spinner" />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-page-empty">
        <BarChart3 size={64} />
        <h3>Sin estadísticas disponibles</h3>
        <p>Empieza a hacer predicciones para ver tus estadísticas</p>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <div className="stats-page-container">
        {/* Header */}
        <div className="stats-page-header">
          <div className="stats-header-content">
            <BarChart3 size={32} className="header-icon" />
            <div>
              <h1 className="stats-page-title">Estadísticas Detalladas</h1>
              <p className="stats-page-subtitle">Análisis completo de tu rendimiento</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="time-range-selector">
            <button 
              className={`time-btn ${timeRange === 'all' ? 'active' : ''}`}
              onClick={() => setTimeRange('all')}
            >
              Todo
            </button>
            <button 
              className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Mes
            </button>
            <button 
              className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Semana
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="stats-overview-grid">
          <div className="overview-card primary">
            <div className="card-icon">
              <Target size={24} />
            </div>
            <div className="card-content">
              <div className="card-label">Precisión General</div>
              <div className="card-value">{stats.accuracy}%</div>
              <div className="card-subtitle">
                {stats.exact + stats.correctResult} de {stats.totalPredictions} correctas
              </div>
            </div>
          </div>

          <div className="overview-card success">
            <div className="card-icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="card-content">
              <div className="card-label">Resultados Exactos</div>
              <div className="card-value">{stats.exact}</div>
              <div className="card-subtitle">
                {stats.exactAccuracy}% de precisión exacta
              </div>
            </div>
          </div>

          <div className="overview-card warning">
            <div className="card-icon">
              <Flame size={24} />
            </div>
            <div className="card-content">
              <div className="card-label">Racha Actual</div>
              <div className="card-value">{stats.currentStreak}</div>
              <div className="card-subtitle">
                Récord: {stats.bestStreak} predicciones
              </div>
            </div>
          </div>

          <div className="overview-card info">
            <div className="card-icon">
              <Zap size={24} />
            </div>
            <div className="card-content">
              <div className="card-label">Puntos Ganados</div>
              <div className="card-value">{stats.totalPoints}</div>
              <div className="card-subtitle">
                De {stats.totalPredictions} predicciones
              </div>
            </div>
          </div>
        </div>

        {/* Results Breakdown */}
        <div className="stats-section">
          <div className="section-header">
            <Trophy size={20} />
            <h2>Desglose de Resultados</h2>
          </div>

          <div className="results-breakdown">
            <div className="result-item exact">
              <div className="result-icon">
                <Star size={20} />
              </div>
              <div className="result-info">
                <div className="result-label">Resultados Exactos</div>
                <div className="result-value">{stats.exact}</div>
                <div className="result-points">+{stats.exact * 5} pts</div>
              </div>
              <div className="result-bar">
                <div 
                  className="result-fill exact-fill" 
                  style={{ 
                    width: `${stats.totalPredictions > 0 ? (stats.exact / stats.totalPredictions) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="result-item correct">
              <div className="result-icon">
                <CheckCircle2 size={20} />
              </div>
              <div className="result-info">
                <div className="result-label">Resultados Correctos</div>
                <div className="result-value">{stats.correctResult}</div>
                <div className="result-points">+{stats.correctResult * 3} pts</div>
              </div>
              <div className="result-bar">
                <div 
                  className="result-fill correct-fill" 
                  style={{ 
                    width: `${stats.totalPredictions > 0 ? (stats.correctResult / stats.totalPredictions) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="result-item wrong">
              <div className="result-icon">
                <XCircle size={20} />
              </div>
              <div className="result-info">
                <div className="result-label">Incorrectos</div>
                <div className="result-value">{stats.wrong}</div>
                <div className="result-points">0 pts</div>
              </div>
              <div className="result-bar">
                <div 
                  className="result-fill wrong-fill" 
                  style={{ 
                    width: `${stats.totalPredictions > 0 ? (stats.wrong / stats.totalPredictions) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* League Performance */}
        {stats.leagueStats.length > 0 && (
          <div className="stats-section">
            <div className="section-header">
              <Award size={20} />
              <h2>Rendimiento por Liga</h2>
            </div>

            <div className="league-stats-list">
              {stats.leagueStats.map((league, index) => (
                <div key={index} className="league-stat-item">
                  <div className="league-rank">#{index + 1}</div>
                  <div className="league-info">
                    <div className="league-name">{league.name}</div>
                    <div className="league-details">
                      {league.correct}/{league.total} correctas • {league.exact} exactas
                    </div>
                  </div>
                  <div className="league-accuracy">
                    <div className="accuracy-circle">
                      <svg width="60" height="60">
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          fill="none"
                          stroke="#F3F4F6"
                          strokeWidth="6"
                        />
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          fill="none"
                          stroke="#7C3AED"
                          strokeWidth="6"
                          strokeDasharray={`${(league.accuracy / 100) * 157} 157`}
                          strokeLinecap="round"
                          transform="rotate(-90 30 30)"
                        />
                      </svg>
                      <div className="accuracy-value">{league.accuracy}%</div>
                    </div>
                  </div>
                  <div className="league-points">
                    <Zap size={16} />
                    <span>{league.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day Performance */}
        <div className="stats-section">
          <div className="section-header">
            <Calendar size={20} />
            <h2>Rendimiento por Día</h2>
          </div>

          <div className="day-stats-grid">
            {stats.dayStats.map((day, index) => (
              <div key={index} className="day-stat-card">
                <div className="day-name">{day.name}</div>
                <div className="day-accuracy">
                  {day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0}%
                </div>
                <div className="day-details">
                  {day.correct}/{day.total}
                </div>
                <div className="day-bar">
                  <div 
                    className="day-fill" 
                    style={{ 
                      height: `${day.total > 0 ? (day.correct / day.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Points Distribution */}
        <div className="stats-section">
          <div className="section-header">
            <TrendingUp size={20} />
            <h2>Distribución de Puntos</h2>
          </div>

          <div className="points-distribution">
            <div className="distribution-item">
              <div className="distribution-label">
                <Target size={16} />
                <span>Partidos</span>
              </div>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill matches" 
                  style={{ 
                    width: `${currentUser?.points > 0 ? (stats.pointsFromMatches / currentUser.points) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="distribution-value">{stats.pointsFromMatches} pts</div>
            </div>

            <div className="distribution-item">
              <div className="distribution-label">
                <Trophy size={16} />
                <span>Ligas</span>
              </div>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill leagues" 
                  style={{ 
                    width: `${currentUser?.points > 0 ? (stats.pointsFromLeagues / currentUser.points) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="distribution-value">{stats.pointsFromLeagues} pts</div>
            </div>

            <div className="distribution-item">
              <div className="distribution-label">
                <Award size={16} />
                <span>Premios</span>
              </div>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill awards" 
                  style={{ 
                    width: `${currentUser?.points > 0 ? (stats.pointsFromAwards / currentUser.points) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="distribution-value">{stats.pointsFromAwards} pts</div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="additional-stats-grid">
          <div className="additional-stat-card">
            <div className="additional-stat-icon">
              <Clock size={20} />
            </div>
            <div className="additional-stat-value">{stats.pendingPredictions}</div>
            <div className="additional-stat-label">Predicciones Pendientes</div>
          </div>

          <div className="additional-stat-card">
            <div className="additional-stat-icon">
              <Trophy size={20} />
            </div>
            <div className="additional-stat-value">{stats.leaguePredictions}</div>
            <div className="additional-stat-label">Predicciones de Ligas</div>
          </div>

          <div className="additional-stat-card">
            <div className="additional-stat-icon">
              <Award size={20} />
            </div>
            <div className="additional-stat-value">{stats.awardPredictions}</div>
            <div className="additional-stat-label">Predicciones de Premios</div>
          </div>

          <div className="additional-stat-card">
            <div className="additional-stat-icon">
              <Percent size={20} />
            </div>
            <div className="additional-stat-value">
              {stats.totalPredictions > 0 
                ? ((stats.exact + stats.correctResult + stats.wrong) / stats.totalPredictions * 100).toFixed(0)
                : 0}%
            </div>
            <div className="additional-stat-label">Tasa de Finalización</div>
          </div>
        </div>
      </div>
    </div>
  );
}
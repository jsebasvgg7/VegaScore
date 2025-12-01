import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Trophy, TrendingUp, Target, Flame, 
  Star, Award, Edit2, Save, X, ArrowLeft, Activity, Percent,
  CheckCircle2, XCircle, Clock, Medal, Globe, Heart, Zap
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import AvatarUpload from '../components/AvatarUpload';
import AchievementsSection from '../components/AchievementsSection';
import '../styles/ProfilePage.css';

export default function ProfilePage({ currentUser, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    favorite_team: currentUser?.favorite_team || '',
    favorite_player: currentUser?.favorite_player || '',
    gender: currentUser?.gender || '',
    nationality: currentUser?.nationality || '',
    avatar_url: currentUser?.avatar_url || null,
    level: currentUser?.level || 1,
    joined_date: currentUser?.created_at || new Date().toISOString()
  });
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [streakData, setStreakData] = useState({
    current_streak: 0,
    best_streak: 0,
    last_prediction_date: null
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    loadUserData();
    loadPredictionHistory();
    calculateStreaks();
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setUserData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          favorite_team: data.favorite_team || '',
          favorite_player: data.favorite_player || '',
          gender: data.gender || '',
          nationality: data.nationality || '',
          avatar_url: data.avatar_url || null,
          level: data.level || 1,
          joined_date: data.created_at
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const loadPredictionHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          matches (
            id,
            league,
            home_team,
            away_team,
            home_team_logo,
            away_team_logo,
            result_home,
            result_away,
            status,
            date,
            time
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictionHistory(data || []);
    } catch (err) {
      console.error('Error loading prediction history:', err);
      showNotification('Error al cargar el historial', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const calculateStreaks = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          matches (
            result_home,
            result_away,
            status,
            date
          )
        `)
        .eq('user_id', currentUser.id)
        .eq('matches.status', 'finished')
        .order('matches.date', { ascending: false });

      if (error) throw error;

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      let lastDate = null;

      const finishedPredictions = (data || [])
        .filter(p => p.matches?.status === 'finished')
        .sort((a, b) => new Date(b.matches.date) - new Date(a.matches.date));

      finishedPredictions.forEach((pred, index) => {
        const match = pred.matches;
        const isCorrect = checkPredictionCorrect(pred, match);

        if (index === 0) lastDate = match.date;

        if (isCorrect) {
          tempStreak++;
          if (index === 0 || isConsecutive(finishedPredictions[index - 1]?.matches.date, match.date)) {
            currentStreak = tempStreak;
          }
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
          if (index === 0) currentStreak = 0;
        }
      });

      setStreakData({
        current_streak: currentStreak,
        best_streak: bestStreak,
        last_prediction_date: lastDate
      });
    } catch (err) {
      console.error('Error calculating streaks:', err);
    }
  };

  const isConsecutive = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const checkPredictionCorrect = (prediction, match) => {
    if (match.result_home === null || match.result_away === null) return false;
    
    const predDiff = Math.sign(prediction.home_score - prediction.away_score);
    const resultDiff = Math.sign(match.result_home - match.result_away);
    
    return predDiff === resultDiff || 
           (prediction.home_score === match.result_home && prediction.away_score === match.result_away);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          bio: userData.bio,
          favorite_team: userData.favorite_team,
          favorite_player: userData.favorite_player,
          gender: userData.gender,
          nationality: userData.nationality
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      showNotification('¡Perfil actualizado exitosamente! 🎉', 'success');
      setIsEditing(false);
      
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      showNotification('Error al actualizar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (newUrl) => {
    setUserData({ ...userData, avatar_url: newUrl });
    showNotification('¡Foto de perfil actualizada!', 'success');
  };

  const getPredictionResult = (pred) => {
    if (!pred.matches || pred.matches.status !== 'finished') {
      return { status: 'pending', points: 0, label: 'Pendiente' };
    }

    const match = pred.matches;
    const exactMatch = pred.home_score === match.result_home && pred.away_score === match.result_away;
    const resultCorrect = Math.sign(pred.home_score - pred.away_score) === Math.sign(match.result_home - match.result_away);

    if (exactMatch) {
      return { status: 'exact', points: 5, label: 'Resultado Exacto' };
    } else if (resultCorrect) {
      return { status: 'correct', points: 3, label: 'Resultado Acertado' };
    } else {
      return { status: 'wrong', points: 0, label: 'Fallado' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const accuracy = currentUser?.predictions > 0 
    ? Math.round((currentUser.correct / currentUser.predictions) * 100) 
    : 0;

  // Calcular puntos necesarios para el siguiente nivel
  const currentLevelPoints = (userData.level - 1) * 20;
  const nextLevelPoints = userData.level * 20;
  const currentPoints = currentUser?.points || 0;
  const pointsInLevel = currentPoints - currentLevelPoints;
  const pointsToNextLevel = nextLevelPoints - currentPoints;
  const levelProgress = (pointsInLevel / 20) * 100;

  return (
    <div className="profile-page">
      {notification && (
        <div className={`simple-notification ${notification.type}`}>
          {notification.type === 'success' && <CheckCircle2 size={20} />}
          {notification.type === 'error' && <XCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="profile-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <h1 className="profile-page-title">Mi Perfil</h1>
      </div>

      <div className="profile-container">
        {/* SECCIÓN SUPERIOR: INFO PERSONAL Y LOGROS */}
        <div className="profile-top-grid">
          {/* Información Personal */}
          <div className="profile-card personal-info">
            <div className="profile-card-header">
              <h2 className="card-title">
                <User size={20} />
                Información Personal
              </h2>
              <button 
                className={`edit-button ${isEditing ? 'active' : ''}`}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={loading}
              >
                {loading ? (
                  <Activity size={18} className="spinner" />
                ) : isEditing ? (
                  <>
                    <Save size={18} />
                    <span>Guardar</span>
                  </>
                ) : (
                  <>
                    <Edit2 size={18} />
                    <span>Editar</span>
                  </>
                )}
              </button>
              {isEditing && (
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setIsEditing(false);
                    loadUserData();
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="personal-info-content">
              {/* Avatar */}
              <div className="avatar-section">
                {isEditing ? (
                  <AvatarUpload
                    currentUrl={userData.avatar_url}
                    userId={currentUser.id}
                    onUploadComplete={handleAvatarUpload}
                  />
                ) : (
                  <div className="profile-avatar-display">
                    {userData.avatar_url ? (
                      <img 
                        src={userData.avatar_url} 
                        alt={userData.name}
                        className="avatar-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="avatar-placeholder"
                      style={{ display: userData.avatar_url ? 'none' : 'flex' }}
                    >
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Campos de información */}
              <div className="profile-fields-grid">
                <div className="profile-field">
                  <label className="profile-label">
                    <User size={16} />
                    <span>Nombre</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="profile-input"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      placeholder="Tu nombre"
                    />
                  ) : (
                    <div className="profile-value">{userData.name}</div>
                  )}
                </div>

                <div className="profile-field">
                  <label className="profile-label">
                    <Trophy size={16} />
                    <span>Equipo Favorito</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="profile-input"
                      value={userData.favorite_team}
                      onChange={(e) => setUserData({ ...userData, favorite_team: e.target.value })}
                      placeholder="Ej: Real Madrid"
                    />
                  ) : (
                    <div className="profile-value">
                      {userData.favorite_team || 'No especificado'}
                    </div>
                  )}
                </div>

                <div className="profile-field">
                  <label className="profile-label">
                    <Heart size={16} />
                    <span>Jugador Favorito</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="profile-input"
                      value={userData.favorite_player}
                      onChange={(e) => setUserData({ ...userData, favorite_player: e.target.value })}
                      placeholder="Ej: Lionel Messi"
                    />
                  ) : (
                    <div className="profile-value">
                      {userData.favorite_player || 'No especificado'}
                    </div>
                  )}
                </div>

                <div className="profile-field">
                  <label className="profile-label">
                    <User size={16} />
                    <span>Género</span>
                  </label>
                  {isEditing ? (
                    <select
                      className="profile-input"
                      value={userData.gender}
                      onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                      <option value="Prefiero no decir">Prefiero no decir</option>
                    </select>
                  ) : (
                    <div className="profile-value">
                      {userData.gender || 'No especificado'}
                    </div>
                  )}
                </div>

                <div className="profile-field">
                  <label className="profile-label">
                    <Globe size={16} />
                    <span>Nacionalidad</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="profile-input"
                      value={userData.nationality}
                      onChange={(e) => setUserData({ ...userData, nationality: e.target.value })}
                      placeholder="Ej: Colombia"
                    />
                  ) : (
                    <div className="profile-value">
                      {userData.nationality || 'No especificado'}
                    </div>
                  )}
                </div>

                <div className="profile-field full-width">
                  <label className="profile-label">
                    <Star size={16} />
                    <span>Biografía</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      className="profile-textarea"
                      value={userData.bio}
                      onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                      placeholder="Cuéntanos sobre ti..."
                      rows={3}
                    />
                  ) : (
                    <div className="profile-value">
                      {userData.bio || 'Sin descripción'}
                    </div>
                  )}
                </div>

                <div className="profile-field">
                  <label className="profile-label">
                    <Calendar size={16} />
                    <span>Miembro desde</span>
                  </label>
                  <div className="profile-value">{formatDate(userData.joined_date)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Nivel y Logros */}
          <div className="profile-achievements-card">
            {/* Nivel */}
            <div className="level-section">
              <div className="level-header">
                <Zap size={24} style={{ color: '#f59e0b' }} />
                <div>
                  <h3 className="level-title">Nivel {userData.level}</h3>
                  <p className="level-subtitle">{pointsToNextLevel} pts para nivel {userData.level + 1}</p>
                </div>
              </div>
              
              <div className="level-progress-bar">
                <div 
                  className="level-progress-fill" 
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>

              <div className="level-points-info">
                <span>{currentPoints} pts</span>
                <span>{nextLevelPoints} pts</span>
              </div>
            </div>

            {/* Mini logros destacados */}
            <div className="profile-stats-grid">
          <div className="profile-stat-card primary">
            <div className="stat-icon-wrapper">
              <TrendingUp size={20} />
            </div>
                <div className="mini-achievement-info">
                  <span className="mini-achievement-label">Total Puntos</span>
                  <span className="mini-achievement-value">{currentUser?.points || 0}</span>
                </div>
              </div>

              <div className="mini-achievement-item">
                <div className="mini-achievement-icon">🎯</div>
                <div className="mini-achievement-info">
                  <span className="mini-achievement-label">Aciertos</span>
                  <span className="mini-achievement-value">
                    {currentUser?.correct || 0}/{currentUser?.predictions || 0}
                  </span>
                </div>
              </div>

              <div className="mini-achievement-item">
                <div className="mini-achievement-icon">📊</div>
                <div className="mini-achievement-info">
                  <span className="mini-achievement-label">Precisión</span>
                  <span className="mini-achievement-value">{accuracy}%</span>
                </div>
              </div>

              <div className="mini-achievement-item">
                <div className="mini-achievement-icon">🔥</div>
                <div className="mini-achievement-info">
                  <span className="mini-achievement-label">Mejor Racha</span>
                  <span className="mini-achievement-value">{streakData.best_streak}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas completas */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card primary">
            <div className="stat-icon-wrapper">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Puntos Totales</div>
              <div className="stat-value">{currentUser?.points || 0}</div>
            </div>
          </div>

          <div className="profile-stat-card success">
            <div className="stat-icon-wrapper">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Aciertos</div>
              <div className="stat-value">
                {currentUser?.correct || 0}/{currentUser?.predictions || 0}
              </div>
            </div>
          </div>

          <div className="profile-stat-card warning">
            <div className="stat-icon-wrapper">
              <Percent size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Precisión</div>
              <div className="stat-value">{accuracy}%</div>
            </div>
          </div>

          <div className="profile-stat-card fire">
            <div className="stat-icon-wrapper">
              <Flame size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Racha Actual</div>
              <div className="stat-value">{streakData.current_streak}</div>
            </div>
          </div>
        </div>

        {/* Rachas */}
        <div className="streaks-section">
          <h2 className="section-title">
            <Flame size={22} />
            Rachas
          </h2>
          <div className="streaks-grid">
            <div className="streak-card current">
              <div className="streak-icon">
                <Flame size={32} />
              </div>
              <div className="streak-info">
                <div className="streak-label">Racha Actual</div>
                <div className="streak-value">{streakData.current_streak}</div>
                <div className="streak-sublabel">predicciones seguidas</div>
              </div>
            </div>

            <div className="streak-card best">
              <div className="streak-icon">
                <Medal size={32} />
              </div>
              <div className="streak-info">
                <div className="streak-label">Mejor Racha</div>
                <div className="streak-value">{streakData.best_streak}</div>
                <div className="streak-sublabel">tu récord personal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Logros y Títulos */}
        <AchievementsSection 
          userId={currentUser.id}
          userStats={{
            points: currentUser?.points || 0,
            predictions: currentUser?.predictions || 0,
            correct: currentUser?.correct || 0,
            best_streak: streakData.best_streak
          }}
        />

        {/* Historial de Predicciones */}
        <div className="history-section">
          <h2 className="section-title">
            <Activity size={22} />
            Historial de Predicciones
          </h2>

          {historyLoading ? (
            <div className="history-loading">
              <Activity size={32} className="spinner" />
              <p>Cargando historial...</p>
            </div>
          ) : predictionHistory.length === 0 ? (
            <div className="history-empty">
              <Target size={48} />
              <p>Aún no has hecho predicciones</p>
              <span>¡Comienza a predecir resultados para ver tu historial!</span>
            </div>
          ) : (
            <div className="history-list">
              {predictionHistory.map((pred) => {
                const result = getPredictionResult(pred);
                const match = pred.matches;

                return (
                  <div key={pred.id} className={`history-item ${result.status}`}>
                    <div className="history-match-info">
                      <div className="history-league">{match?.league}</div>
                      <div className="history-teams">
                        <span className="history-team">
                          {match?.home_team_logo} {match?.home_team}
                        </span>
                        <span className="history-vs">vs</span>
                        <span className="history-team">
                          {match?.away_team} {match?.away_team_logo}
                        </span>
                      </div>
                      <div className="history-date">
                        <Clock size={14} />
                        {match?.date} • {match?.time}
                      </div>
                    </div>

                    <div className="history-prediction">
                      <div className="history-label">Tu predicción</div>
                      <div className="history-score">
                        {pred.home_score} - {pred.away_score}
                      </div>
                    </div>

                    {match?.status === 'finished' && (
                      <div className="history-result-box">
                        <div className="history-label">Resultado final</div>
                        <div className="history-score">
                          {match.result_home} - {match.result_away}
                        </div>
                      </div>
                    )}

                    <div className={`history-status ${result.status}`}>
                      {result.status === 'exact' && <CheckCircle2 size={18} />}
                      {result.status === 'correct' && <CheckCircle2 size={18} />}
                      {result.status === 'wrong' && <XCircle size={18} />}
                      {result.status === 'pending' && <Clock size={18} />}
                      <div className="status-content">
                        <span className="status-label">{result.label}</span>
                        {result.points > 0 && (
                          <span className="status-points">+{result.points} pts</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
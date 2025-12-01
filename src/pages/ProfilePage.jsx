import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Trophy, TrendingUp, Target, Flame, 
  Star, Award, Edit2, Save, X, ArrowLeft, Activity, Percent,
  CheckCircle2, XCircle, Clock, Medal, Globe, Heart, Zap,
  Crown, Shield, Rocket, Sparkles, TrendingDown, BarChart3,
  Gamepad2, Award as AwardIcon, Target as TargetIcon,
  Clock as ClockIcon, Users, MapPin, Flag
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
        .order('created_at', { ascending: false })
        .limit(10);

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
        {/* SECCIÓN SUPERIOR: Información y Stats */}
        <div className="profile-top-section">
          {/* Card de Avatar y Info Básica */}
          <div className="avatar-card">
            <div className="avatar-wrapper">
              {isEditing ? (
                <AvatarUpload
                  currentUrl={userData.avatar_url}
                  userId={currentUser.id}
                  onUploadComplete={handleAvatarUpload}
                />
              ) : (
                <div className="avatar-display">
                  {userData.avatar_url ? (
                    <img 
                      src={userData.avatar_url} 
                      alt={userData.name}
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="avatar-badge">
                    <Crown size={16} />
                    <span>Nivel {userData.level}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="avatar-info">
              <h2 className="user-name">{userData.name}</h2>
              <div className="user-meta">
                <span className="user-email">{userData.email}</span>
                <div className="user-joined">
                  <Calendar size={14} />
                  <span>{formatDate(userData.joined_date)}</span>
                </div>
              </div>
              
              <div className="user-favorites">
                {userData.favorite_team && (
                  <div className="favorite-item">
                    <Trophy size={16} />
                    <span>{userData.favorite_team}</span>
                  </div>
                )}
                {userData.favorite_player && (
                  <div className="favorite-item">
                    <Heart size={16} />
                    <span>{userData.favorite_player}</span>
                  </div>
                )}
              </div>
              
              <button 
                className="edit-profile-button"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={loading}
              >
                {loading ? (
                  <Activity size={16} className="spinner" />
                ) : isEditing ? (
                  <>
                    <Save size={16} />
                    <span>Guardar Cambios</span>
                  </>
                ) : (
                  <>
                    <Edit2 size={16} />
                    <span>Editar Perfil</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card de Estadísticas Principales */}
          <div className="stats-card">
            <div className="stats-header">
              <BarChart3 size={24} />
              <h3>Estadísticas Principales</h3>
            </div>
            
            <div className="stats-grid">
              <div className="stat-item primary">
                <div className="stat-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Puntos Totales</div>
                  <div className="stat-value">{currentUser?.points || 0}</div>
                </div>
              </div>

              <div className="stat-item success">
                <div className="stat-icon">
                  <Target size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Precisión</div>
                  <div className="stat-value">{accuracy}%</div>
                </div>
              </div>

              <div className="stat-item warning">
                <div className="stat-icon">
                  <Flame size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Racha Actual</div>
                  <div className="stat-value">{streakData.current_streak}</div>
                </div>
              </div>

              <div className="stat-item accent">
                <div className="stat-icon">
                  <Medal size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Mejor Racha</div>
                  <div className="stat-value">{streakData.best_streak}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN MEDIA: Nivel, Logros y Rachas */}
        <div className="profile-middle-section">
          {/* Card de Progreso de Nivel */}
          <div className="level-card">
            <div className="level-header">
              <div className="level-title-section">
                <Zap size={24} className="level-icon" />
                <div>
                  <h3 className="level-title">Nivel {userData.level}</h3>
                  <p className="level-subtitle">Progreso hacia el siguiente nivel</p>
                </div>
              </div>
              <div className="level-points">
                <span className="current-points">{currentPoints} pts</span>
                <span className="next-level-points">Siguiente: {nextLevelPoints} pts</span>
              </div>
            </div>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${levelProgress}%` }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
              <div className="progress-label">
                <span>{pointsInLevel}/20 puntos</span>
                <span>{pointsToNextLevel} pts restantes</span>
              </div>
            </div>

            {/* Mini Logros dentro de la misma card */}
            <div className="mini-achievements-section">
              <div className="section-header">
                <AwardIcon size={20} />
                <h4>Logros Destacados</h4>
              </div>
              
              <div className="mini-achievements-grid">
                <div className="mini-achievement">
                  <div className="achievement-icon">
                    <TargetIcon size={18} />
                  </div>
                  <div className="achievement-info">
                    <div className="achievement-label">Aciertos</div>
                    <div className="achievement-value">
                      {currentUser?.correct || 0}/{currentUser?.predictions || 0}
                    </div>
                  </div>
                </div>

                <div className="mini-achievement">
                  <div className="achievement-icon">
                    <ClockIcon size={18} />
                  </div>
                  <div className="achievement-info">
                    <div className="achievement-label">Tiempo Activo</div>
                    <div className="achievement-value">{formatDate(userData.joined_date)}</div>
                  </div>
                </div>

                <div className="mini-achievement">
                  <div className="achievement-icon">
                    <Users size={18} />
                  </div>
                  <div className="achievement-info">
                    <div className="achievement-label">Ranking</div>
                    <div className="achievement-value">#{(currentUser?.rank || '--')}</div>
                  </div>
                </div>

                <div className="mini-achievement">
                  <div className="achievement-icon">
                    <Rocket size={18} />
                  </div>
                  <div className="achievement-info">
                    <div className="achievement-label">Consistencia</div>
                    <div className="achievement-value">{streakData.current_streak}d</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Rachas */}
          <div className="streaks-card">
            <div className="streaks-header">
              <Flame size={24} />
              <h3>Tus Rachas</h3>
            </div>
            
            <div className="streaks-content">
              <div className="streak-item current-streak">
                <div className="streak-icon">
                  <Flame size={32} />
                </div>
                <div className="streak-info">
                  <div className="streak-label">Racha Actual</div>
                  <div className="streak-value">{streakData.current_streak}</div>
                  <div className="streak-subtext">predicciones consecutivas</div>
                </div>
                {streakData.current_streak > 0 && (
                  <div className="streak-badge">
                    <Sparkles size={14} />
                    <span>Activa</span>
                  </div>
                )}
              </div>

              <div className="streak-item best-streak">
                <div className="streak-icon">
                  <Crown size={32} />
                </div>
                <div className="streak-info">
                  <div className="streak-label">Récord Personal</div>
                  <div className="streak-value">{streakData.best_streak}</div>
                  <div className="streak-subtext">tu mejor marca</div>
                </div>
                {streakData.best_streak > 10 && (
                  <div className="record-badge">
                    <Shield size={14} />
                    <span>Épico</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN INFERIOR: Formulario de Edición e Historial */}
        <div className="profile-bottom-section">
          {/* Formulario de Edición (solo visible en modo edición) */}
          {isEditing && (
            <div className="edit-form-card">
              <div className="form-header">
                <h3>Editar Información Personal</h3>
                <button 
                  className="cancel-edit-button"
                  onClick={() => {
                    setIsEditing(false);
                    loadUserData();
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    <span>Nombre Completo</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Trophy size={16} />
                    <span>Equipo Favorito</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={userData.favorite_team}
                    onChange={(e) => setUserData({ ...userData, favorite_team: e.target.value })}
                    placeholder="Ej: Real Madrid"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Heart size={16} />
                    <span>Jugador Favorito</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={userData.favorite_player}
                    onChange={(e) => setUserData({ ...userData, favorite_player: e.target.value })}
                    placeholder="Ej: Lionel Messi"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    <span>Género</span>
                  </label>
                  <select
                    className="form-input"
                    value={userData.gender}
                    onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                    <option value="Prefiero no decir">Prefiero no decir</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Flag size={16} />
                    <span>Nacionalidad</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={userData.nationality}
                    onChange={(e) => setUserData({ ...userData, nationality: e.target.value })}
                    placeholder="Ej: Colombia"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <Star size={16} />
                    <span>Biografía</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    value={userData.bio}
                    onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                    placeholder="Cuéntanos sobre ti..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="save-button"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Activity size={16} className="spinner" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
                <button 
                  className="cancel-button-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    loadUserData();
                  }}
                >
                  <X size={16} />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          )}

          {/* Historial de Predicciones */}
          <div className="history-card">
            <div className="history-header">
              <div className="history-title-section">
                <Activity size={24} />
                <h3>Historial Reciente</h3>
              </div>
              <button className="view-all-button">
                <span>Ver Todo</span>
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>

            {historyLoading ? (
              <div className="history-loading">
                <Activity size={32} className="spinner" />
                <p>Cargando historial...</p>
              </div>
            ) : predictionHistory.length === 0 ? (
              <div className="history-empty">
                <Gamepad2 size={48} />
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
                      <div className="match-info">
                        <div className="league-badge">{match?.league}</div>
                        <div className="teams">
                          <div className="team home-team">
                            <span className="team-name">{match?.home_team}</span>
                            {match?.home_team_logo && (
                              <span className="team-logo">{match?.home_team_logo}</span>
                            )}
                          </div>
                          <div className="vs">vs</div>
                          <div className="team away-team">
                            {match?.away_team_logo && (
                              <span className="team-logo">{match?.away_team_logo}</span>
                            )}
                            <span className="team-name">{match?.away_team}</span>
                          </div>
                        </div>
                        <div className="match-time">
                          <Clock size={14} />
                          <span>{match?.date} • {match?.time}</span>
                        </div>
                      </div>

                      <div className="prediction-result">
                        <div className="scores">
                          <div className="score-section">
                            <div className="score-label">Tu predicción</div>
                            <div className="score-value">
                              {pred.home_score} - {pred.away_score}
                            </div>
                          </div>
                          
                          {match?.status === 'finished' && (
                            <div className="score-section">
                              <div className="score-label">Resultado</div>
                              <div className="score-value">
                                {match.result_home} - {match.result_away}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={`result-status ${result.status}`}>
                          <div className="status-icon">
                            {result.status === 'exact' && <CheckCircle2 size={18} />}
                            {result.status === 'correct' && <CheckCircle2 size={18} />}
                            {result.status === 'wrong' && <XCircle size={18} />}
                            {result.status === 'pending' && <Clock size={18} />}
                          </div>
                          <div className="status-info">
                            <span className="status-label">{result.label}</span>
                            {result.points > 0 && (
                              <span className="status-points">+{result.points} pts</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Componente de Logros Completos */}
        <AchievementsSection 
          userId={currentUser.id}
          userStats={{
            points: currentUser?.points || 0,
            predictions: currentUser?.predictions || 0,
            correct: currentUser?.correct || 0,
            best_streak: streakData.best_streak,
            accuracy: accuracy
          }}
        />
      </div>
    </div>
  );
}
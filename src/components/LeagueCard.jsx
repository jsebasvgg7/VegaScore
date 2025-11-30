import React, { useState } from 'react';
import { Trophy, Target, Award, Star, CheckCircle2, Calendar, Shield } from 'lucide-react';
import '../styles/LeagueCard.css';

export default function LeagueCard({ league, userPrediction, onPredict }) {
  const [champion, setChampion] = useState(userPrediction?.predicted_champion ?? '');
  const [topScorer, setTopScorer] = useState(userPrediction?.predicted_top_scorer ?? '');
  const [topAssist, setTopAssist] = useState(userPrediction?.predicted_top_assist ?? '');
  const [mvp, setMvp] = useState(userPrediction?.predicted_mvp ?? '');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = () => {
    if (!champion.trim() || !topScorer.trim() || !topAssist.trim() || !mvp.trim()) {
      alert('Por favor completa todas las predicciones');
      return;
    }
    onPredict(league.id, champion.trim(), topScorer.trim(), topAssist.trim(), mvp.trim());
  };

  const hasPrediction = userPrediction !== undefined;
  const isFinished = league.status === 'finished';
  const deadline = league.deadline ? new Date(league.deadline).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }) : null;

  return (
    <div 
      className="league-card-premium"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Header */}
      <div className="league-header-premium">
        <div className="league-logo-section">
          <div className="league-logo-big">{league.logo}</div>
          <div className="league-info-header">
            <h3 className="league-name-premium">{league.name}</h3>
            <span className="league-season">{league.season}</span>
          </div>
        </div>
        
        {deadline && !isFinished && (
          <div className="league-deadline">
            <Calendar size={14} />
            <span>Hasta {deadline}</span>
          </div>
        )}

        {isFinished && (
          <div className="league-status finished">
            <CheckCircle2 size={14} />
            <span>Finalizada</span>
          </div>
        )}
      </div>

      {/* Formulario de predicciones */}
      <div className="league-predictions-form">
        {/* Campeón - Ancho completo */}
        <div className="prediction-field full-width">
          <label className="prediction-label">
            <Shield size={16} />
            <span>Campeón de la competicion</span>
          </label>
          <input
            type="text"
            className="prediction-input champion-input"
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            placeholder="..."
            disabled={isFinished}
          />
          {isFinished && league.champion && (
            <div className="actual-result">
              <CheckCircle2 size={14} />
              <span>
                <strong>{league.champion}</strong>
                {champion.toLowerCase() === league.champion.toLowerCase() && 
                  <strong className="correct-badge"> ✓ Correcto!</strong>
                }
              </span>
            </div>
          )}
        </div>

        {/* Goleador y Asistidor en grid */}
        <div className="prediction-field">
          <label className="prediction-label">
            <Trophy size={16} />
            <span>Máximo Goleador</span>
          </label>
          <input
            type="text"
            className="prediction-input"
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            placeholder="..."
            disabled={isFinished}
          />
          {isFinished && league.top_scorer && (
            <div className="actual-result">
              <CheckCircle2 size={14} />
              <span>
                {league.top_scorer} ({league.top_scorer_goals} goles)
                {topScorer.toLowerCase() === league.top_scorer.toLowerCase() && 
                  <strong className="correct-badge"> ✓ Correcto!</strong>
                }
              </span>
            </div>
          )}
        </div>

        <div className="prediction-field">
          <label className="prediction-label">
            <Target size={16} />
            <span>Máximo Asistidor</span>
          </label>
          <input
            type="text"
            className="prediction-input"
            value={topAssist}
            onChange={(e) => setTopAssist(e.target.value)}
            placeholder="..."
            disabled={isFinished}
          />
          {isFinished && league.top_assist && (
            <div className="actual-result">
              <CheckCircle2 size={14} />
              <span>
                {league.top_assist} ({league.top_assist_count} asistencias)
                {topAssist.toLowerCase() === league.top_assist.toLowerCase() && 
                  <strong className="correct-badge"> ✓ Correcto!</strong>
                }
              </span>
            </div>
          )}
        </div>

        <div className="prediction-field">
          <label className="prediction-label">
            <Award size={16} />
            <span>Jugador MVP</span>
          </label>
          <input
            type="text"
            className="prediction-input"
            value={mvp}
            onChange={(e) => setMvp(e.target.value)}
            placeholder="..."
            disabled={isFinished}
          />
          {isFinished && league.mvp_player && (
            <div className="actual-result">
              <CheckCircle2 size={14} />
              <span>
                {league.mvp_player}
                {mvp.toLowerCase() === league.mvp_player.toLowerCase() && 
                  <strong className="correct-badge"> ✓ Correcto!</strong>
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer con predicción guardada o botón */}
      {hasPrediction && !isFinished && (
        <div className="prediction-saved-badge">
          <CheckCircle2 size={16} />
          <span>Predicción guardada</span>
          {userPrediction.points_earned > 0 && (
            <span className="points-earned">+{userPrediction.points_earned} pts</span>
          )}
        </div>
      )}

      {isFinished && userPrediction && (
        <div className="final-points-banner">
          <Star size={18} />
          <span>Obtuviste {userPrediction.points_earned} puntos en esta liga</span>
        </div>
      )}

      {!isFinished && (
        <button className="predict-league-btn" onClick={handleSubmit}>
          <Star size={18} />
          <span>{hasPrediction ? 'Actualizar Predicción' : 'Guardar Predicción'}</span>
          <div className="btn-glow"></div>
        </button>
      )}
    </div>
  );
}
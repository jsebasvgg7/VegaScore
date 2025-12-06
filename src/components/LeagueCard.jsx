// src/components/LeagueCard.jsx
import React, { useState } from 'react';
import { Trophy, Target, Award, Star, CheckCircle2, Calendar, Shield } from 'lucide-react';
import '../styles/LeagueCard.css';

export default function LeagueCard({ league, userPrediction, onPredict }) {
  // Función para renderizar el logo (URL de imagen o emoji de fallback)
  const renderLeagueLogo = (logoUrl, fallbackEmoji) => {
    if (logoUrl && logoUrl.startsWith('http')) {
      return (
        <img 
          src={logoUrl} 
          alt="League logo" 
          className="league-logo-img"
          onError={(e) => {
            // Si la imagen falla, mostrar el emoji
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      );
    }
    // Si no hay URL, usar emoji
    return <span className="league-logo-emoji-display">{fallbackEmoji || '🏆'}</span>;
  };

  const [champion, setChampion] = useState(userPrediction?.predicted_champion ?? '');
  const [topScorer, setTopScorer] = useState(userPrediction?.predicted_top_scorer ?? '');
  const [topAssist, setTopAssist] = useState(userPrediction?.predicted_top_assist ?? '');
  const [mvp, setMvp] = useState(userPrediction?.predicted_mvp ?? '');

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

  const isPredictionChanged = (
    champion !== userPrediction?.predicted_champion ||
    topScorer !== userPrediction?.predicted_top_scorer ||
    topAssist !== userPrediction?.predicted_top_assist ||
    mvp !== userPrediction?.predicted_mvp
  );

  const showSaveButton = !isFinished && (!hasPrediction || isPredictionChanged);

  return (
    <div className="league-card-light">
      {/* Header */}
      <div className="league-header-light">
        <div className="league-info-section">
          <div className="league-logo-container">
            {renderLeagueLogo(league.logo_url, league.logo)}
            <span className="league-logo-emoji-display" style={{ display: 'none' }}>
              {league.logo}
            </span>
          </div>
          <div className="league-text-info">
            <h3 className="league-name-light">{league.name}</h3>
            <span className="league-season-light">{league.season}</span>
          </div>
        </div>
        
        {deadline && !isFinished && (
          <div className="league-deadline-badge">
            <Calendar size={12} />
            <span>Hasta {deadline}</span>
          </div>
        )}

        {isFinished && (
          <div className="league-status-badge finished">
            <CheckCircle2 size={12} />
            <span>Finalizada</span>
          </div>
        )}
      </div>

      {/* Formulario de predicciones */}
      <div className="league-predictions-container">
        {/* Campeón - Ancho completo */}
        <div className="prediction-group full-width">
          <label className="prediction-label-light">
            <Shield size={14} />
            <span>Campeón de la competición</span>
          </label>
          <input
            type="text"
            className={`prediction-input-light ${hasPrediction ? 'has-prediction' : ''}`}
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            placeholder="Escribe el equipo..."
            disabled={isFinished}
          />
          {isFinished && league.champion && (
            <div className="actual-result-light">
              <CheckCircle2 size={12} />
              <span>
                <strong>{league.champion}</strong>
                {champion.toLowerCase() === league.champion.toLowerCase() && 
                  <strong className="correct-indicator"> ✓ Correcto</strong>
                }
              </span>
            </div>
          )}
        </div>

        {/* Goleador, Asistidor y MVP en grid */}
        <div className="prediction-group">
          <label className="prediction-label-light">
            <Trophy size={14} />
            <span>Máximo Goleador</span>
          </label>
          <input
            type="text"
            className={`prediction-input-light ${hasPrediction ? 'has-prediction' : ''}`}
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            placeholder="Jugador..."
            disabled={isFinished}
          />
          {isFinished && league.top_scorer && (
            <div className="actual-result-light">
              <CheckCircle2 size={12} />
              <span>
                {league.top_scorer} ({league.top_scorer_goals}g)
                {topScorer.toLowerCase() === league.top_scorer.toLowerCase() && 
                  <strong className="correct-indicator"> ✓</strong>
                }
              </span>
            </div>
          )}
        </div>

        <div className="prediction-group">
          <label className="prediction-label-light">
            <Target size={14} />
            <span>Máximo Asistidor</span>
          </label>
          <input
            type="text"
            className={`prediction-input-light ${hasPrediction ? 'has-prediction' : ''}`}
            value={topAssist}
            onChange={(e) => setTopAssist(e.target.value)}
            placeholder="Jugador..."
            disabled={isFinished}
          />
          {isFinished && league.top_assist && (
            <div className="actual-result-light">
              <CheckCircle2 size={12} />
              <span>
                {league.top_assist} ({league.top_assist_count}a)
                {topAssist.toLowerCase() === league.top_assist.toLowerCase() && 
                  <strong className="correct-indicator"> ✓</strong>
                }
              </span>
            </div>
          )}
        </div>

        <div className="prediction-group">
          <label className="prediction-label-light">
            <Award size={14} />
            <span>Jugador MVP</span>
          </label>
          <input
            type="text"
            className={`prediction-input-light ${hasPrediction ? 'has-prediction' : ''}`}
            value={mvp}
            onChange={(e) => setMvp(e.target.value)}
            placeholder="Jugador..."
            disabled={isFinished}
          />
          {isFinished && league.mvp_player && (
            <div className="actual-result-light">
              <CheckCircle2 size={12} />
              <span>
                {league.mvp_player}
                {mvp.toLowerCase() === league.mvp_player.toLowerCase() && 
                  <strong className="correct-indicator"> ✓</strong>
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="league-footer-light">
        {isFinished && userPrediction ? (
          <div className="final-points-display">
            <Star size={16} />
            <span>Obtuviste {userPrediction.points_earned} puntos</span>
          </div>
        ) : !isFinished && hasPrediction && !showSaveButton ? (
          <span className="prediction-status-light">
            <CheckCircle2 size={14} style={{color: '#059669'}}/>
            Predicción guardada
            {userPrediction.points_earned > 0 && (
              <span className="points-badge">+{userPrediction.points_earned} pts</span>
            )}
          </span>
        ) : showSaveButton ? (
          <button className="predict-button-light" onClick={handleSubmit}>
            <Star size={16} />
            <span>{hasPrediction ? 'Actualizar' : 'Guardar'}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
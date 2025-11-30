import React, { useState } from "react";
import { Calendar, Clock, TrendingUp, Zap, CheckCircle2 } from "lucide-react";

export default function MatchCard({ match, userPred, onPredict }) {
  const [homeScore, setHomeScore] = useState(userPred?.home_score ?? "");
  const [awayScore, setAwayScore] = useState(userPred?.away_score ?? "");
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = () => {
    if (homeScore === "" || awayScore === "") {
      alert("Ingresa un marcador válido");
      return;
    }
    onPredict(match.id, parseInt(homeScore), parseInt(awayScore));
  };

  const hasPrediction = userPred !== undefined;

  return (
    <div 
      className="match-card-premium"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Header con gradiente */}
      <div className="match-header-premium">
        <div className="league-badge">
          <Zap size={14} />
          <span>{match.league}</span>
        </div>
        
        <div className="match-datetime">
          <div className="datetime-item">
            <Calendar size={13} />
            <span>{match.date}</span>
          </div>
          <div className="datetime-item">
            <Clock size={13} />
            <span>{match.time}</span>
          </div>
        </div>
      </div>

      {/* Equipos con animación */}
      <div className="teams-premium">
        <div className="team-premium home">
          <div className="team-logo-container">
            <div className="team-logo-bg"></div>
            <span className="team-logo-premium">{match.home_team_logo}</span>
          </div>
          <div className="team-info">
            <span className="team-name-premium">{match.home_team}</span>
            <span className="team-label">Local</span>
          </div>
        </div>

        {/* Score inputs con diseño moderno */}
        <div className="score-section">
          <div className="score-inputs-premium">
            <input
              type="number"
              min="0"
              max="20"
              className="score-input-premium"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="?"
            />
            <div className="vs-premium">VS</div>
            <input
              type="number"
              min="0"
              max="20"
              className="score-input-premium"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="?"
            />
          </div>
          
          {hasPrediction && (
            <div className="prediction-badge">
              <CheckCircle2 size={14} />
              <span>Predicción guardada</span>
            </div>
          )}
        </div>

        <div className="team-premium away">
          <div className="team-info">
            <span className="team-name-premium">{match.away_team}</span>
            <span className="team-label">Visitante</span>
          </div>
          <div className="team-logo-container">
            <div className="team-logo-bg"></div>
            <span className="team-logo-premium">{match.away_team_logo}</span>
          </div>
        </div>
      </div>

      {/* Botón con gradiente y efecto */}
      <button className="predict-btn-premium" onClick={handleSubmit}>
        <TrendingUp size={18} />
        <span>{hasPrediction ? "Actualizar Predicción" : "Guardar Predicción"}</span>
        <div className="btn-glow"></div>
      </button>
    </div>
  );
}
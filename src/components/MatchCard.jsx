import React, { useState } from "react";
import { Calendar, Clock, Zap, CheckCircle2 } from "lucide-react";
import "../styles/MatchCard.css";

export default function MatchCard({ match, userPred, onPredict }) {
  const [homeScore, setHomeScore] = useState(userPred?.home_score ?? "");
  const [awayScore, setAwayScore] = useState(userPred?.away_score ?? "");

  const handleSubmit = () => {
    if (homeScore === "" || awayScore === "") {
      alert("Ingresa un marcador válido");
      return;
    }
    onPredict(match.id, parseInt(homeScore), parseInt(awayScore));
  };

  const hasPrediction = userPred !== undefined;
  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now > deadline;
  const isDisabled = isPastDeadline || match.status !== "pending";

  return (
    <div className="match-card-modern">
      {/* Header Compacto */}
      <div className="match-header-modern">
        <div className="match-league-info">
          <Zap size={14} className="league-icon" />
          <span className="league-name">{match.league}</span>
        </div>
        <div className="match-datetime-info">
          <span className="match-date">
            <Calendar size={12} />
            {match.date}
          </span>
          <span className="match-time">
            <Clock size={12} />
            {match.time}
          </span>
        </div>
      </div>

      {/* Equipos con Marcador Integrado */}
      <div className="match-teams-container">
        {/* Equipo Local */}
        <div className="team-box team-home">
          <div className="team-color-indicator home-color"></div>
          <div className="team-content">
            <span className="team-logo">{match.home_team_logo}</span>
            <div className="team-details">
              <span className="team-name">{match.home_team}</span>
              <span className="team-label">Local</span>
            </div>
          </div>
          <input
            type="number"
            min="0"
            max="20"
            className="score-input-inline"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="?"
            disabled={isDisabled}
          />
        </div>

        {/* VS Divisor */}
        <div className="vs-divider">
          <span className="vs-text">VS</span>
        </div>

        {/* Equipo Visitante */}
        <div className="team-box team-away">
          <input
            type="number"
            min="0"
            max="20"
            className="score-input-inline"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="?"
            disabled={isDisabled}
          />
          <div className="team-content">
            <div className="team-details">
              <span className="team-name">{match.away_team}</span>
              <span className="team-label">Visitante</span>
            </div>
            <span className="team-logo">{match.away_team_logo}</span>
          </div>
          <div className="team-color-indicator away-color"></div>
        </div>
      </div>

      {/* Footer con Estado y Botón */}
      <div className="match-footer-modern">
        {hasPrediction && (
          <div className="prediction-status saved">
            <CheckCircle2 size={14} />
            <span>Predicción guardada</span>
          </div>
        )}
        
        {!isDisabled && (
          <button 
            className="predict-button-modern" 
            onClick={handleSubmit}
          >
            <span>{hasPrediction ? "Actualizar" : "Guardar"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
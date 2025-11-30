// src/components/MatchCard.jsx
import React, { useState } from "react";

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

  return (
    <div className="match-card">
      <div className="match-header">
        <div className="league-name">{match.league}</div>
        <div className="match-date">
          {match.date} · {match.time}
        </div>
      </div>

      <div className="teams-row">
        <div className="team">
          <span className="team-logo">{match.home_team_logo}</span>
          <span className="team-name">{match.home_team}</span>
        </div>

        <div className="prediction-inputs">
          <input
            type="number"
            min="0"
            max="20"
            className="score-input"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="0"
          />
          <span className="vs">-</span>
          <input
            type="number"
            min="0"
            max="20"
            className="score-input"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="team">
          <span className="team-logo">{match.away_team_logo}</span>
          <span className="team-name">{match.away_team}</span>
        </div>
      </div>

      <button className="btn predict-btn" onClick={handleSubmit}>
        {userPred ? "Actualizar Predicción" : "Guardar Predicción"}
      </button>
    </div>
  );
}
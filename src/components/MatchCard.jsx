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
          <span className="team-logo">{match.homeTeamLogo}</span>
          <span className="team-name">{match.homeTeam}</span>
        </div>

        <div className="prediction-inputs">
          <input
            type="number"
            className="score-input"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
          />
          <span className="vs">-</span>
          <input
            type="number"
            className="score-input"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
          />
        </div>

        <div className="team">
          <span className="team-logo">{match.awayTeamLogo}</span>
          <span className="team-name">{match.awayTeam}</span>
        </div>
      </div>

      <button className="btn predict-btn" onClick={handleSubmit}>
        Guardar Predicción
      </button>
    </div>
  );
}

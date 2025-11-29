// src/components/MatchCard.jsx
import React from "react";
import "../index.css";

export default function MatchCard({ match, userPred, onPredict }) {
  return (
    <div className="match-card-figma card">
      <div className="league-tag">⚡ {match.league}</div>

      <div className="teams-rows">
        <div className="team-row">
          <div className="team-left">
            <div className="team-avatar">{match.homeTeamLogo || "🏠"}</div>
            <div className="team-name">{match.homeTeam}</div>
          </div>
          {userPred && <div className="pred-score">{userPred.homeScore}</div>}
        </div>

        <div className="team-row">
          <div className="team-left">
            <div className="team-avatar">{match.awayTeamLogo || "✈️"}</div>
            <div className="team-name">{match.awayTeam}</div>
          </div>
          {userPred && <div className="pred-score">{userPred.awayScore}</div>}
        </div>
      </div>

      <div className="match-footer">
        <div className="match-date">📅 {new Date(match.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}</div>
        <div className="match-time">🕐 {match.time}</div>
      </div>

      {!userPred ? (
        <div className="prediction-row">
          <input id={`home-${match.id}`} type="number" min="0" max="20" placeholder="0" className="input-small" />
          <span className="dash">-</span>
          <input id={`away-${match.id}`} type="number" min="0" max="20" placeholder="0" className="input-small" />
          <button
            className="btn predict-btn"
            onClick={() => {
              const home = parseInt(document.getElementById(`home-${match.id}`).value);
              const away = parseInt(document.getElementById(`away-${match.id}`).value);
              if (!isNaN(home) && !isNaN(away)) onPredict(match.id, home, away);
              else alert("Por favor ingresa valores válidos");
            }}
          >
            Predecir
          </button>
        </div>
      ) : (
        <button
          className="btn edit-btn"
          onClick={() => {
            const home = prompt("Nuevos goles equipo local:", userPred.homeScore);
            const away = prompt("Nuevos goles equipo visitante:", userPred.awayScore);
            if (home !== null && away !== null) onPredict(match.id, parseInt(home), parseInt(away));
          }}
        >
          Editar Predicción
        </button>
      )}
    </div>
  );
}

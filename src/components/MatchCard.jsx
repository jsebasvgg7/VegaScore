// src/components/MatchCard.jsx
import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Clock, 
  CheckCircle2,
  Calendar
} from "lucide-react";
import "../styles/MatchCard.css"; 

export default function MatchCard({ match, userPred, onPredict }) {
  const initialHomeScore = userPred?.home_score ?? "";
  const initialAwayScore = userPred?.away_score ?? "";

  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);
  const [isSaved, setIsSaved] = useState(userPred !== undefined);

  useEffect(() => {
    setHomeScore(userPred?.home_score ?? "");
    setAwayScore(userPred?.away_score ?? "");
    setIsSaved(userPred !== undefined);
  }, [userPred]);
  
  const handleScoreChange = (team, value) => {
    if (isDisabled) return;
    
    const numericValue = parseInt(value, 10);
    const score = isNaN(numericValue) || numericValue < 0 ? value : Math.min(numericValue, 20);

    if (team === 'home') {
      setHomeScore(score);
    } else {
      setAwayScore(score);
    }
    setIsSaved(false);
  };

  const handleSubmit = () => {
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (homeScore === "" || awayScore === "" || isNaN(home) || isNaN(away)) {
        alert("Por favor, ingresa un marcador válido en ambos campos.");
        return;
    }

    if (isSaved && home === userPred.home_score && away === userPred.away_score) {
      return; 
    }

    onPredict(match.id, home, away);
    setIsSaved(true);
  };

  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now > deadline;
  const isDisabled = isPastDeadline || match.status !== "pending";

  const isPredictionChanged = (
    parseInt(homeScore) !== userPred?.home_score || 
    parseInt(awayScore) !== userPred?.away_score
  );
  const showSaveButton = !isDisabled && (!isSaved || isPredictionChanged);

  // Función para renderizar el logo (URL de imagen o emoji de fallback)
  const renderTeamLogo = (logoUrl, fallbackEmoji) => {
    if (logoUrl && logoUrl.startsWith('http')) {
      return (
        <img 
          src={logoUrl} 
          alt="Team logo" 
          className="team-logo-img"
          onError={(e) => {
            // Si la imagen falla, mostrar el emoji
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      );
    }
    // Si no hay URL, usar emoji
    return <span className="team-logo-emoji">{fallbackEmoji || '⚽'}</span>;
  };

  // Función para formatear la fecha
  const formatMatchDate = (dateString) => {
    // Si ya viene formateado como texto (ej: "Hoy", "Mañana")
    if (dateString && typeof dateString === 'string' && !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    // Si es una fecha en formato YYYY-MM-DD
    try {
      // Parsear la fecha en hora local (evita problemas de zona horaria)
      const [year, month, day] = dateString.split('-').map(Number);
      const matchDate = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Normalizar las fechas para comparar solo día/mes/año
      const normalizeDate = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      };

      const normalizedMatch = normalizeDate(matchDate);
      const normalizedToday = normalizeDate(today);
      const normalizedTomorrow = normalizeDate(tomorrow);

      if (normalizedMatch.getTime() === normalizedToday.getTime()) {
        return 'Hoy';
      } else if (normalizedMatch.getTime() === normalizedTomorrow.getTime()) {
        return 'Mañana';
      } else {
        // Formato: "15 Dic"
        return matchDate.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        });
      }
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="match-card-light">
      
      <div className="match-header-light">
        {/* Liga y Hora */}
        <div className="match-league-info-light">
          <Zap size={14} className="league-icon" />
          <span className="league-name">{match.league}</span>
          <span className="match-datetime-separator">•</span>
          <span className="match-time">
            <Clock size={12} />
            {match.time}
          </span>
        </div>
        
        {/* Fecha del partido en la esquina */}
        <div className="match-date-badge">
          <Calendar size={12} />
          <span>{formatMatchDate(match.date)}</span>
        </div>
      </div>

      <div className="match-content-light">
        
        {/* Equipo Local */}
        <div className="team-box-light team-home">
          <div className="team-logo-light">
            {renderTeamLogo(match.home_team_logo_url, match.home_team_logo)}
            <span className="team-logo-emoji" style={{ display: 'none' }}>
              {match.home_team_logo}
            </span>
          </div>
          <span className="team-name-light">{match.home_team}</span>
        </div>

        {/* Controles de Predicción */}
        <div className="prediction-controls">
          
          <div className="score-display-light">
            <div className={`score-cell-light ${isSaved ? 'has-prediction' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input-in-cell"
                value={homeScore}
                onChange={(e) => handleScoreChange('home', e.target.value)}
                placeholder="0"
                disabled={isDisabled}
              />
              {isSaved && <div className="prediction-check-light"><CheckCircle2 size={12} /></div>}
            </div>
            
            <div className={`score-cell-light ${isSaved ? 'has-prediction' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input-in-cell"
                value={awayScore}
                onChange={(e) => handleScoreChange('away', e.target.value)}
                placeholder="0"
                disabled={isDisabled}
              />
              {isSaved && <div className="prediction-check-light"><CheckCircle2 size={12} /></div>}
            </div>
          </div>
           
          {showSaveButton && (
            <button
              className="predict-button-light"
              onClick={handleSubmit}
              style={{ marginTop: '8px', width: '100%' }}
            >
              {isSaved ? "Update" : "Save"}
            </button>
          )}

        </div>

        {/* Equipo Visitante */}
        <div className="team-box-light team-away">
          <div className="team-logo-light">
            {renderTeamLogo(match.away_team_logo_url, match.away_team_logo)}
            <span className="team-logo-emoji" style={{ display: 'none' }}>
              {match.away_team_logo}
            </span>
          </div>
          <span className="team-name-light">{match.away_team}</span>
        </div>
      </div>

      <div className="match-footer-light">
        {isDisabled ? (
          <span className="prediction-status-light" style={{color: '#ef4444'}}>
             <Clock size={14} /> Plazo de predicción expirado
          </span>
        ) : !showSaveButton && isSaved ? (
          <span className="prediction-status-light">
            <CheckCircle2 size={14} style={{color: '#059669'}}/>
            Predicción guardada
          </span>
        ) : null}
      </div>

    </div>
  );
}
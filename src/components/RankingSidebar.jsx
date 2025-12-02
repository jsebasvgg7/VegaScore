// src/components/RankingSidebar.jsx
import React, { useState } from "react";
import { Medal, Crown, Award, Trophy, Flame, TrendingUp, Star } from "lucide-react";
import "../styles/RankingSidebar.css";

export default function RankingSidebar({ users = [] }) { // ← Valor por defecto
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Validación temprana
  if (!users || users.length === 0) {
    return (
      <div className="ranking-premium">
        <div className="ranking-header-premium">
          <div className="ranking-title-premium">
            <Trophy size={22} className="trophy-icon-animated" />
            <div>
              <h3>Ranking Global</h3>
              <p className="ranking-subtitle">0 competidores</p>
            </div>
          </div>
        </div>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
          <p>No hay usuarios registrados aún</p>
        </div>
      </div>
    );
  }

  const getIcon = (index) => {
    if (index === 0) return <Crown size={20} className="rank-icon gold" />;
    if (index === 1) return <Medal size={20} className="rank-icon silver" />;
    if (index === 2) return <Medal size={20} className="rank-icon bronze" />;
    return <Award size={18} className="rank-icon regular" />;
  };

  const getPodiumClass = (index) => {
    if (index === 0) return "podium-first";
    if (index === 1) return "podium-second";
    if (index === 2) return "podium-third";
    return "";
  };

  const getTopBadge = (index) => {
    if (index === 0) return { icon: <Flame size={14} />, text: "¡Líder!", color: "#ff6b35" };
    if (index === 1) return { icon: <Star size={14} />, text: "Top 2", color: "#c0c0c0" };
    if (index === 2) return { icon: <TrendingUp size={14} />, text: "Top 3", color: "#cd7f32" };
    return null;
  };

  return (
    <div className="ranking-premium">
      {/* Header con efecto glassmorphism */}
      <div className="ranking-header-premium">
        <div className="ranking-title-premium">
          <Trophy size={22} className="trophy-icon-animated" />
          <div>
            <h3>Ranking Global</h3>
            <p className="ranking-subtitle">{users.length} competidores</p>
          </div>
        </div>
      </div>

      {/* Podio para top 3 */}
      <div className="podium-container">
        {users.slice(0, 3).map((user, index) => {
          const badge = getTopBadge(index);
          return (
            <div key={user.id} className={`podium-card ${getPodiumClass(index)}`}>
              <div className="podium-rank">
                {getIcon(index)}
                <span className="podium-position">#{index + 1}</span>
              </div>
              <div className="podium-avatar">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="podium-info">
                <span className="podium-name">{user.name || 'Usuario'}</span>
                <div className="podium-points">
                  <Star size={14} />
                  <span>{user.points || 0} pts</span>
                </div>
              </div>
              {badge && (
                <div className="top-badge" style={{ backgroundColor: badge.color }}>
                  {badge.icon}
                  <span>{badge.text}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resto del ranking */}
      {users.length > 3 && (
        <div className="ranking-list-premium">
          <div className="ranking-divider">
            <span>Tabla de posiciones</span>
          </div>
          
          {users.slice(3).map((user, idx) => {
            const index = idx + 3;
            const predictions = user.predictions || 0;
            const correct = user.correct || 0;
            const accuracy = predictions > 0 ? Math.round((correct / predictions) * 100) : 0;
            
            return (
              <div
                key={user.id}
                className={`ranking-item-premium ${hoveredIndex === index ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="rank-number">#{index + 1}</div>
                
                <div className="rank-user-info">
                  <div className="rank-avatar-small">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="rank-details">
                    <span className="rank-name-text">{user.name || 'Usuario'}</span>
                    <span className="rank-stats-text">
                      {predictions > 0 
                        ? `${accuracy}% precisión`
                        : 'Sin predicciones'}
                    </span>
                  </div>
                </div>

                <div className="rank-points-premium">
                  <span className="points-number">{user.points || 0}</span>
                  <span className="points-label">pts</span>
                </div>

                <div className="rank-progress">
                  <div 
                    className="rank-progress-bar"
                    style={{ 
                      width: users[0]?.points > 0 
                        ? `${((user.points || 0) / users[0].points) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer con estadísticas */}
      <div className="ranking-footer">
        <div className="ranking-stat">
          <Award size={16} />
          <span>{users.reduce((acc, u) => acc + (u.predictions || 0), 0)} predicciones</span>
        </div>
        <div className="ranking-stat">
          <TrendingUp size={16} />
          <span>{users.reduce((acc, u) => acc + (u.points || 0), 0)} pts totales</span>
        </div>
      </div>
    </div>
  );
}
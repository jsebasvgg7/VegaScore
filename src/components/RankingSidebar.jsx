// src/components/RankingSidebar.jsx
import React from "react";
import "../index.css";

export default function RankingSidebar({ users = [] }) {
  const top = users.slice(0, 3);
  const rest = users.slice(3, 10);

  return (
    <div className="ranking-wrapper">
      <div className="ranking-head">
        <div className="ranking-badge">🏆</div>
        <div>
          <div className="ranking-title">Ranking Global</div>
          <div className="ranking-sub">Top jugadores</div>
        </div>
        <div className="ranking-count">🔥 {users.length}</div>
      </div>

      <div className="podium">
        {top[1] && (
          <div className="podium-item second">
            <div className="podion-name">{top[1].name}</div>
            <div className="podion-pts">{top[1].points} pts</div>
          </div>
        )}

        {top[0] && (
          <div className="podium-item first">
            <div className="podion-name">{top[0].name}</div>
            <div className="podion-pts">{top[0].points} pts</div>
          </div>
        )}

        {top[2] && (
          <div className="podium-item third">
            <div className="podion-name">{top[2].name}</div>
            <div className="podion-pts">{top[2].points} pts</div>
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <div className="ranking-list">
          {rest.map((u, i) => (
            <div key={u.id} className="ranking-item">
              <div className="rank-left">#{i + 4} {u.name}</div>
              <div className="rank-right">{u.points}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

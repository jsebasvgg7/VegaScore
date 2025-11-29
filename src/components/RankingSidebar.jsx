// src/components/RankingSidebar.jsx
import React from "react";

export default function RankingSidebar({ users }) {
  return (
    <div className="ranking card">
      <h3 className="ranking-title">Ranking Global</h3>

      <ul className="ranking-list">
        {users.map((u, index) => (
          <li key={u.id} className="ranking-item">
            <span className="rank-pos">#{index + 1}</span>
            <span className="rank-name">{u.name}</span>
            <span className="rank-points">{u.points} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useState } from "react";
import "../styles/RankingPage.css";
import useRanking from "../hooks/useRanking";
import RankingSidebar from "../components/RankingSidebar";

export default function RankingPage() {
  const [filter, setFilter] = useState("global");
  const { ranking, loading, error } = useRanking(filter);

  if (loading) {
    return (
      <div className="ranking-root">
        <div className="ranking-content">
          <p className="ranking-loading">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-root">
        <div className="ranking-content">
          <p className="ranking-error" style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
            Error al cargar el ranking: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-root">

      {/* SIDEBAR SOLO PC */}
      <aside className="ranking-sidebar-desktop">
        <RankingSidebar users={ranking} />
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="ranking-content">

        <h2 className="ranking-title">Ranking General</h2>

        {/* ================= FILTROS ================= */}
        <div className="ranking-filters">
          <button
            className={filter === "global" ? "filter active" : "filter"}
            onClick={() => setFilter("global")}
          >
            Global
          </button>

          <button
            className={filter === "monthly" ? "filter active" : "filter"}
            onClick={() => setFilter("monthly")}
          >
            Mensual
          </button>
        </div>

        {/* ================= LISTA ================= */}
        {!ranking || ranking.length === 0 ? (
          <p className="ranking-empty">No hay jugadores registrados.</p>
        ) : (
          <div className="ranking-list">
            {ranking.map((user, index) => (
              <div key={user.id} className="ranking-card">

                <span className="ranking-position">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </span>

                <div className="ranking-avatar">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name}
                      className="ranking-avatar-img"
                    />
                  ) : (
                    <div className="ranking-avatar-placeholder">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="ranking-info">
                  <h4>{user.name || user.email || 'Usuario'}</h4>
                  <p>{user.points || 0} pts</p>
                </div>

                <div className="ranking-stats">
                  <span className="ranking-stat-item">
                    {user.predictions || 0} predicciones
                  </span>
                  {user.predictions > 0 && (
                    <span className="ranking-stat-item">
                      {Math.round(((user.correct || 0) / user.predictions) * 100)}% precisión
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

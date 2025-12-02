import useRanking from "../hooks/useRanking";
import RankingSidebar from "../components/RankingSidebar";
import { useState } from "react";

export default function RankingPage() {
  const [filter, setFilter] = useState("global");
  const { ranking, loading } = useRanking(filter);

  if (loading) {
    return <p className="ranking-loading">Cargando ranking...</p>;
  }

  return (
    <div className="ranking-root">

      {/* SIDEBAR SOLO PC */}
      <aside className="ranking-sidebar-desktop">
        <RankingSidebar />
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
        {ranking.length === 0 ? (
          <p className="ranking-empty">No hay jugadores registrados.</p>
        ) : (
          <div className="ranking-list">
            {ranking.map((u, index) => (
              <div key={u.id} className="ranking-card">

                <span className="ranking-position">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </span>

                <img
                  src={u.avatar_url || "/default-avatar.png"}
                  className="ranking-avatar"
                />

                <div className="ranking-info">
                  <h4>{u.username}</h4>
                  <p>{u.points} pts</p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

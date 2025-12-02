// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import useMatches from "../hooks/useMatches";
import useLeagues from "../hooks/useLeagues";
import useAwards from "../hooks/useAwards";

import MatchCard from "../components/MatchCard";
import LeagueCard from "../components/LeagueCard";
import AwardCard from "../components/AwardCard";
import AchievementsSection from "../components/AchievementsSection";

import "../styles/HomePage.css";

export default function HomePage() {
  const { matches, loading: loadingMatches } = useMatches();
  const { leagues, loading: loadingLeagues } = useLeagues();
  const { awards, loading: loadingAwards } = useAwards();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return;

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (userData) {
        setCurrentUser(userData);
        setUserStats({
          points: userData.points || 0,
          predictions: userData.predictions || 0,
          correct: userData.correct || 0,
          best_streak: userData.best_streak || 0
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  return (
    <div className="home-wrapper">
      
      {/* ==================== STATS / ACHIEVEMENTS ==================== */}
      <section className="home-section">
        <h2 className="home-title">Estadísticas</h2>
        <AchievementsSection 
          userId={currentUser?.id} 
          userStats={userStats}
        />
      </section>

      {/* ==================== PARTIDOS ==================== */}
      <section className="home-section">
        <h2 className="home-title">Próximos Partidos</h2>

        {loadingMatches ? (
          <p className="loading-text">Cargando partidos...</p>
        ) : matches.length === 0 ? (
          <p className="empty-text">No hay partidos disponibles.</p>
        ) : (
          <div className="grid-list">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== LIGAS ==================== */}
      <section className="home-section">
        <h2 className="home-title">Ligas Activas</h2>

        {loadingLeagues ? (
          <p className="loading-text">Cargando ligas...</p>
        ) : leagues.length === 0 ? (
          <p className="empty-text">No hay ligas activas.</p>
        ) : (
          <div className="grid-list">
            {leagues.map((l) => (
              <LeagueCard key={l.id} league={l} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== PREMIOS ==================== */}
      <section className="home-section">
        <h2 className="home-title">Premios</h2>

        {loadingAwards ? (
          <p className="loading-text">Cargando premios...</p>
        ) : awards.length === 0 ? (
          <p className="empty-text">No hay premios disponibles.</p>
        ) : (
          <div className="grid-list">
            {awards.map((a) => (
              <AwardCard key={a.id} award={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
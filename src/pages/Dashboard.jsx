import React, { useState } from "react";
import { Trophy, TrendingUp, Target, Percent, Plus } from "lucide-react";

// Componentes y hooks
import MatchCard from "../components/MatchCard";
import LeagueCard from "../components/LeagueCard";
import AwardCard from "../components/AwardCard";
import NavigationTabs from "../components/NavigationTabs";
import ProfilePage from "./ProfilePage";
import { ToastContainer, useToast } from "../components/Toast";
import { PageLoader, StatCardSkeleton } from "../components/LoadingStates"; // Para el loading interno
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { usePredictionActions } from "../hooks/usePredictionActions"; // NUEVO: Hook de Acciones

// Importar estilos
import "../styles/VegaScorePage.css"; 

export default function Dashboard() {
  // 1. OBTENER DATOS DE CONTEXTO Y CARGA
  const { profile: currentUser, loading: authLoading } = useAuth();
  const { 
    matches, leagues, awards, users, loading: dataLoading, 
    setMatches, setLeagues, setAwards, refreshData 
  } = useDashboardData();
  
  // 2. OBTENER TOAST Y ACCIONES
  const toast = useToast();
  // Se inicializa el hook de acciones con las dependencias necesarias
  const { 
    actionLoading, makePrediction, makeLeaguePrediction, makeAwardPrediction 
    // Las funciones de Admin (setMatchResult, addMatch, etc.) ya no son necesarias aquí
  } = usePredictionActions(currentUser, toast, refreshData); 

  // --- ESTADOS DE LA VISTA ---
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');

  if (authLoading || !currentUser) {
    // Si la autenticación está cargando o el usuario no está, esperamos (aunque MainLayout ya lo maneja)
    return <PageLoader />; 
  }

  if (showProfile) {
    return (
      <ProfilePage 
        currentUser={currentUser} 
        onBack={() => setShowProfile(false)} 
      />
    );
  }

  // --- LÓGICA DE FILTRADO ---
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const pendingMatches = matches.filter((m) => m.status === "pending");
  const activeLeagues = leagues.filter((l) => l.status === "active");
  const activeAwards = awards.filter((a) => a.status === "active");
  
  // Función que usa el hook de acciones
  const handleMatchPrediction = (matchId, homeScore, awayScore) => {
    makePrediction(matchId, homeScore, awayScore, matches, setMatches);
  };

  const handleLeaguePrediction = (leagueId, champion, topScorer, topAssist, mvp) => {
    makeLeaguePrediction(leagueId, champion, topScorer, topAssist, mvp, setLeagues);
  };
  
  const handleAwardPrediction = (awardId, predictedWinner) => {
    makeAwardPrediction(awardId, predictedWinner, setAwards);
  };

  // --- RENDERIZADO DEL DASHBOARD DE USUARIO ---
  return (
    <>
      <section className="stats-row">
        {dataLoading ? (
          // Usar Skeletons mientras cargan los datos
          <StatCardSkeleton count={4} />
        ) : (
          <>
            <div className="stat-card">
              <Trophy size={24} className="icon-main" />
              <h3>{currentUser.points}</h3>
              <p>Puntos Acumulados</p>
            </div>
            {/* Otros stat-cards... */}
            <div className="stat-card" onClick={() => setShowProfile(true)}>
              <div className="avatar-placeholder">
                <p>{currentUser.name?.charAt(0) || 'U'}</p>
              </div>
              <h3>{currentUser.name}</h3>
              <p>Ver Perfil</p>
            </div>
          </>
        )}
      </section>

      {/* Main Grid: Ahora solo incluye la columna izquierda (Contenido) */}
      <section className="main-grid">
        <div className="left-col">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {dataLoading ? (
            <p>Cargando partidos...</p> // Podrías usar MatchListSkeleton aquí
          ) : (
            <div className="matches-section-premium">
              {/* Pestaña de Partidos */}
              {activeTab === 'matches' && (
                <div className="matches-container">
                  {pendingMatches.length > 0 ? (
                    pendingMatches.map((m) => (
                      <MatchCard 
                        key={m.id} 
                        match={m} 
                        currentUserId={currentUser.id}
                        onPredict={handleMatchPrediction}
                        isLoading={actionLoading}
                      />
                    ))
                  ) : (
                    <div className="empty-state">
                      <span>No hay partidos pendientes</span>
                    </div>
                  )}
                </div>
              )}

              {/* Pestaña de Ligas */}
              {activeTab === 'leagues' && (
                <div className="leagues-container">
                  {activeLeagues.length > 0 ? (
                    activeLeagues.map((l) => (
                      <LeagueCard 
                        key={l.id} 
                        league={l} 
                        currentUserId={currentUser.id}
                        onPredict={handleLeaguePrediction}
                        isLoading={actionLoading}
                      />
                    ))
                  ) : (
                    <div className="empty-state">
                      <span>No hay ligas activas</span>
                    </div>
                  )}
                </div>
              )}

              {/* Pestaña de Premios */}
              {activeTab === 'awards' && (
                <div className="awards-container">
                  {activeAwards.length > 0 ? (
                    activeAwards.map((a) => (
                      <AwardCard 
                        key={a.id} 
                        award={a} 
                        currentUserId={currentUser.id}
                        onPredict={handleAwardPrediction}
                        isLoading={actionLoading}
                      />
                    ))
                  ) : (
                    <div className="empty-state">
                      <span>No hay premios activos</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ¡IMPORTANTE! El Ranking y el Admin Panel han sido removidos de aquí. */}
        {/* Serán creados en las páginas /ranking y /admin. */}
        <div className="right-col">
           {/* Este espacio puede quedar vacío o usarse para publicidad/noticias ligeras */}
           <p className="sidebar-note">El Ranking se ha movido a su propia página.</p>
        </div>
      </section>
      
      {/* Ya no hay Modals de Admin aquí */}

      {/* El componente LoadingOverlay que usaste antes */}
      {/* {actionLoading && <LoadingOverlay message="Procesando..." />} */}

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}
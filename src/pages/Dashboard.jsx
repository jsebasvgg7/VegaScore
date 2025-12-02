// src/pages/Dashboard.jsx (Código COMPLETO)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Nuevo: para la navegación
import { Trophy, TrendingUp, Target, Percent } from "lucide-react";

// Componentes y hooks
import MatchCard from "../components/MatchCard";
import LeagueCard from "../components/LeagueCard";
import AwardCard from "../components/AwardCard";
import NavigationTabs from "../components/NavigationTabs";
import { ToastContainer, useToast } from "../components/Toast";
import { PageLoader, StatCardSkeleton } from "../components/LoadingStates";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { usePredictionActions } from "../hooks/usePredictionActions";

// Estilos
import "../styles/VegaScorePage.css"; 

export default function Dashboard() {
  // 1. OBTENER DATOS DE CONTEXTO Y CARGA
  const { profile: currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // Inicializar hook de navegación

  const { 
    matches, leagues, awards, users, loading: dataLoading, 
    setMatches, setLeagues, setAwards, refreshData 
  } = useDashboardData();
  
  // 2. OBTENER TOAST Y ACCIONES
  const toast = useToast();
  const { 
    actionLoading, makePrediction, makeLeaguePrediction, makeAwardPrediction 
  } = usePredictionActions(currentUser, toast, refreshData); 

  // --- ESTADOS DE LA VISTA ---
  const [activeTab, setActiveTab] = useState('matches');

  // Si el usuario no está cargado, mostramos el loader.
  if (authLoading || !currentUser) {
    return <PageLoader />; 
  }
  
  // --- LÓGICA DE FILTRADO ---
  const pendingMatches = matches.filter((m) => m.status === "pending");
  const activeLeagues = leagues.filter((l) => l.status === "active");
  const activeAwards = awards.filter((a) => a.status === "active");
  
  // Funciones que usan el hook de acciones
  const handleMatchPrediction = (matchId, homeScore, awayScore) => {
    makePrediction(matchId, homeScore, awayScore, matches, setMatches);
  };

  const handleLeaguePrediction = (leagueId, champion, topScorer, topAssist, mvp) => {
    makeLeaguePrediction(leagueId, champion, topScorer, topAssist, mvp, setLeagues);
  };
  
  const handleAwardPrediction = (awardId, predictedWinner) => {
    makeAwardPrediction(awardId, predictedWinner, setAwards);
  };


  return (
    <>
      <section className="main-grid">
        <div className="left-col">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {dataLoading ? (
            <p className="loading-message">Cargando datos...</p>
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
                    <div className="empty-state"><span>No hay partidos pendientes</span></div>
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
                    <div className="empty-state"><span>No hay ligas activas</span></div>
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
                    <div className="empty-state"><span>No hay premios activos</span></div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Ya no hay Modals de Admin aquí */}

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}
import React, { useState } from "react";
import { Plus, CheckCircle, Trophy, Shield, Zap, Award as AwardIcon } from "lucide-react";

// Hooks y Contexto
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { usePredictionActions } from "../hooks/usePredictionActions";
import { useToast } from "../components/Toast";

// Componentes y Modals de Administración (deben ser importados desde components)
import AdminModal from "../components/AdminModal";
import AdminLeagueModal from "../components/AdminLeagueModal";
import AdminAwardModal from "../components/AdminAwardModal";
import FinishMatchModal from "../components/FinishMatchModal"; // Asumo que tienes un modal para esto
import FinishLeagueModal from "../components/FinishLeagueModal";
import FinishAwardModal from "../components/FinishAwardModal";
import { PageLoader, LoadingOverlay } from "../components/LoadingStates";

export default function AdminPanel() {
  const { profile: currentUser, loading: authLoading, isAdmin } = useAuth();
  const { 
    matches, leagues, awards, loading: dataLoading, 
    setMatches, setLeagues, setAwards, refreshData 
  } = useDashboardData();
  const toast = useToast();

  // 1. ESTADO DE MODALS Y SELECCIONES (Movido del antiguo VegaScorePage)
  const [showAdminModal, setShowAdminModal] = useState(false); // Añadir partido
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);
  const [matchToFinish, setMatchToFinish] = useState(null);
  
  const [showAdminLeagueModal, setShowAdminLeagueModal] = useState(false); // Añadir liga
  const [showFinishLeagueModal, setShowFinishLeagueModal] = useState(false);
  const [leagueToFinish, setLeagueToFinish] = useState(null);
  
  const [showAdminAwardModal, setShowAdminAwardModal] = useState(false); // Añadir premio
  const [showFinishAwardModal, setShowFinishAwardModal] = useState(false);
  const [awardToFinish, setAwardToFinish] = useState(null);

  // 2. INTEGRACIÓN DE ACCIONES
  const { 
    actionLoading, addMatch, setMatchResult, addLeague, finishLeague, addAward, finishAward 
  } = usePredictionActions(currentUser, toast, refreshData);
  
  // --- GUARDIA DE SEGURIDAD ---
  if (authLoading) return <PageLoader />;
  if (!isAdmin) {
    return (
      <div className="admin-denied" style={{ textAlign: 'center', marginTop: '50px' }}>
        <Shield size={64} color="red" />
        <h2>🚫 Acceso Denegado</h2>
        <p>Tu cuenta no tiene permisos de administrador para acceder a esta sección.</p>
      </div>
    );
  }

  // --- HANDLERS SIMPLIFICADOS (Usando las funciones del Hook) ---

  const handleAddMatch = (matchData) => {
    addMatch(matchData, setMatches);
    setShowAdminModal(false); // Cerrar modal después de la acción
  };

  const handleSetMatchResult = (matchId, homeScore, awayScore) => {
    // setMatchResult ya maneja el refreshData y el toast.
    setMatchResult(matchId, homeScore, awayScore);
    setShowFinishMatchModal(false);
    setMatchToFinish(null);
  };
  
  const handleFinishLeague = (leagueId, results) => {
    finishLeague(leagueId, results);
    setShowFinishLeagueModal(false);
    setLeagueToFinish(null);
  };

  // ---------------------------------------------------------------
  
  // Filtrar ítems pendientes de administrar
  const matchesPendingResult = matches.filter(m => m.status === 'pending');
  const activeLeagues = leagues.filter(l => l.status === 'active');
  const activeAwards = awards.filter(a => a.status === 'active');

  return (
    <div className="admin-panel">
      <h1>⚙️ Panel de Administración</h1>
      <p>Gestión de Partidos, Ligas y Premios.</p>
      
      {/* Botones de Acción Rápida */}
      <section className="admin-actions">
        <button className="btn-admin primary" onClick={() => setShowAdminModal(true)}>
          <Plus size={18} /> Añadir Partido
        </button>
        <button className="btn-admin secondary" onClick={() => setShowAdminLeagueModal(true)}>
          <Trophy size={18} /> Añadir Liga
        </button>
        <button className="btn-admin secondary" onClick={() => setShowAdminAwardModal(true)}>
          <AwardIcon size={18} /> Añadir Premio
        </button>
      </section>

      {/* Listas para Administrar / Finalizar */}
      <section className="admin-lists">
        <h2>Partidos Pendientes de Resultado ({matchesPendingResult.length})</h2>
        {dataLoading ? (
          <p>Cargando lista...</p>
        ) : (
          <div className="list-container">
            {matchesPendingResult.map(match => (
              <div key={match.id} className="admin-list-item">
                <span>{match.home_team} vs {match.away_team} ({new Date(match.deadline).toLocaleDateString()})</span>
                <button 
                  className="btn-finish" 
                  onClick={() => {
                    setMatchToFinish(match);
                    setShowFinishMatchModal(true);
                  }}
                >
                  <CheckCircle size={16} /> Finalizar
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* ... (Añadir listas similares para Ligas y Premios) ... */}
        
        <h2>Ligas Activas ({activeLeagues.length})</h2>
        <div className="list-container">
            {activeLeagues.map(league => (
                <div key={league.id} className="admin-list-item">
                    <span>{league.name}</span>
                    <button 
                        className="btn-finish" 
                        onClick={() => {
                            setLeagueToFinish(league);
                            setShowFinishLeagueModal(true);
                        }}
                    >
                        <CheckCircle size={16} /> Finalizar Liga
                    </button>
                </div>
            ))}
        </div>
        
        {/* ... (Lista de Premios) ... */}

      </section>

      {/* 3. RENDERING DE MODALS (Movido del antiguo VegaScorePage) */}
      {showAdminModal && (
        <AdminModal onAdd={handleAddMatch} onClose={() => setShowAdminModal(false)} />
      )}
      {showFinishMatchModal && matchToFinish && (
        <FinishMatchModal 
          match={matchToFinish}
          onFinish={handleSetMatchResult}
          onClose={() => {
            setShowFinishMatchModal(false);
            setMatchToFinish(null);
          }}
        />
      )}
      
      {showAdminLeagueModal && (
        <AdminLeagueModal 
          onAdd={addLeague} 
          onClose={() => setShowAdminLeagueModal(false)} 
        />
      )}
      {showFinishLeagueModal && leagueToFinish && (
        <FinishLeagueModal 
          league={leagueToFinish}
          onFinish={handleFinishLeague}
          onClose={() => {
            setShowFinishLeagueModal(false);
            setLeagueToFinish(null);
          }}
        />
      )}
      
      {/* ... (Añadir Modals de Award: AdminAwardModal y FinishAwardModal) ... */}

      {actionLoading && <LoadingOverlay message="Procesando..." />}
    </div>
  );
}
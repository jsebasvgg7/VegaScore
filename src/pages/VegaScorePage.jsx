// src/pages/VegaScorePage.jsx
import React, { useState } from "react";
import { Trophy, TrendingUp, Target, Percent } from "lucide-react";

// Components
import MatchCard from "../components/MatchCard";
import LeagueCard from "../components/LeagueCard";
import AwardCard from "../components/AwardCard";
import NavigationTabs from "../components/NavigationTabs";
import ProfilePage from "./ProfilePage";
import RankingPage from "./RankingPage";
import AdminPage from "./AdminPage";
import { PageLoader, LoadingOverlay } from "../components/LoadingStates";
import { ToastContainer, useToast } from "../components/Toast";

// Custom Hooks
import { useDataLoader } from "../hooks/useDataLoader";
import { useMatches } from "../hooks/useMatches";
import { useLeagues } from "../hooks/useLeagues";
import { useAwards } from "../hooks/useAwards";

// Styles
import "../styles/VegaScorePage.css";

export default function VegaScorePage() {
  // ========== STATE MANAGEMENT ==========
  const [showProfile, setShowProfile] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');

  const toast = useToast();

  // ========== CUSTOM HOOKS ==========
  const {
    currentUser,
    users,
    matches,
    leagues,
    awards,
    loading,
    error,
    updateUsers,
    updateMatches,
    updateLeagues,
    updateAwards
  } = useDataLoader();

  const {
    loading: matchesLoading,
    makePrediction,
    addMatch,
    finishMatch
  } = useMatches(currentUser);

  const {
    loading: leaguesLoading,
    makeLeaguePrediction,
    addLeague,
    finishLeague: finishLeagueHook
  } = useLeagues(currentUser);

  const {
    loading: awardsLoading,
    makeAwardPrediction,
    addAward,
    finishAward: finishAwardHook
  } = useAwards(currentUser);

  // ========== HANDLERS - PAGINAS ==========
  const handleBackToHome = () => {
    setShowProfile(false);
    setShowRanking(false);
    setShowAdmin(false);
  };
  // ========== HANDLERS - MATCHES ==========
  const handleMakePrediction = async (matchId, homeScore, awayScore) => {
    const match = matches.find(m => m.id === matchId);
    if (match?.deadline) {
      const now = new Date();
      const deadline = new Date(match.deadline);
      if (now > deadline) {
        toast.warning("El tiempo para hacer predicciones ha expirado");
        return;
      }
    }

    await makePrediction(
      matchId,
      homeScore,
      awayScore,
      (matchList) => {
        updateMatches(matchList);
        toast.success("¡Predicción guardada exitosamente! 🎯");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  // ========== HANDLERS - LEAGUES ==========
  const handleMakeLeaguePrediction = async (leagueId, champion, topScorer, topAssist, mvp) => {
    await makeLeaguePrediction(
      leagueId,
      champion,
      topScorer,
      topAssist,
      mvp,
      (leagueList) => {
        updateLeagues(leagueList);
        toast.success("¡Predicción de liga guardada exitosamente! 🏆");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  // ========== HANDLERS - AWARDS ==========
  const handleMakeAwardPrediction = async (awardId, predictedWinner) => {
    await makeAwardPrediction(
      awardId,
      predictedWinner,
      (awardList) => {
        updateAwards(awardList);
        toast.success("¡Predicción guardada exitosamente! 🏆");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  // ========== RENDER ==========
  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="centered">
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="centered">
        <div>Error: No se pudo cargar el usuario</div>
      </div>
    );
  }

  // Mostrar páginas secundarias
  if (showProfile) {
    return (
      <>
        <ProfilePage 
          currentUser={currentUser} 
          onBack={() => setShowProfile(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showRanking) {
    return (
      <>
        <RankingPage 
          currentUser={currentUser}
          users={users.sort((a, b) => b.points - a.points)}
          onBack={() => setShowRanking(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showAdmin) {
    return (
      <>
        <AdminPage 
          currentUser={currentUser}
          users={users.sort((a, b) => b.points - a.points)}
          onBack={() => setShowAdmin(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const pendingMatches = matches.filter((m) => m.status === "pending");
  const activeLeagues = leagues.filter((l) => l.status === "active");
  const activeAwards = awards.filter((a) => a.status === "active");
  const isLoading = matchesLoading || leaguesLoading || awardsLoading;

  return (
    <>
      <div className="vega-root">
        <main className="container">
          {/* --- Stats --- */}
          <section className="stats-row">
            <div className="stat-card">
              <Trophy className="stat-icon" size={24} color="#ff8a00" />
              <div className="stat-label">Posición</div>
              <div className="stat-value">
                #{sortedUsers.findIndex((u) => u.id === currentUser?.id) + 1}
              </div>
            </div>

            <div className="stat-card">
              <TrendingUp className="stat-icon" size={24} color="#ff8a00" />
              <div className="stat-label">Puntos</div>
              <div className="stat-value">{currentUser?.points ?? 0}</div>
            </div>

            <div className="stat-card">
              <Target className="stat-icon" size={24} color="#ff8a00" />
              <div className="stat-label">Aciertos</div>
              <div className="stat-value">
                {currentUser?.correct ?? 0}/{currentUser?.predictions ?? 0}
              </div>
            </div>

            <div className="stat-card">
              <Percent className="stat-icon" size={24} color="#ff8a00" />
              <div className="stat-label">Precisión</div>
              <div className="stat-value">
                {currentUser?.predictions > 0
                  ? Math.round((currentUser.correct / currentUser.predictions) * 100) + "%"
                  : "0%"}
              </div>
            </div>
          </section>

          {/* --- Main Content (Sin Sidebar) --- */}
          <section className="main-content-full">
            <NavigationTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />

            {activeTab === 'matches' && (
              <div className="matches-section-premium">
                <div className="matches-header-premium">
                  <div className="matches-title-section">
                    <div className="matches-icon-wrapper">
                      <Trophy size={22} />
                    </div>
                    <div>
                      <h2 className="matches-title-premium">Próximos Partidos</h2>
                      <p className="matches-subtitle-premium">Haz tus predicciones y gana puntos</p>
                    </div>
                  </div>
                  <div className="matches-badge">
                    <Target size={14} />
                    <span>{pendingMatches.length} disponibles</span>
                  </div>
                </div>

                <div className="matches-container">
                  {pendingMatches.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">⚽</div>
                      <div className="matches-empty-text">No hay partidos disponibles</div>
                      <div className="matches-empty-subtext">Los nuevos partidos aparecerán aquí</div>
                    </div>
                  ) : (
                    pendingMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        userPred={m.predictions?.find(
                          (p) => p.user_id === currentUser?.id
                        )}
                        onPredict={handleMakePrediction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'leagues' && (
              <div className="matches-section-premium">
                <div className="matches-header-premium">
                  <div className="matches-title-section">
                    <div className="matches-icon-wrapper">
                      <Trophy size={22} />
                    </div>
                    <div>
                      <h2 className="matches-title-premium">Competiciones</h2>
                      <p className="matches-subtitle-premium">Predice campeones y goleadores</p>
                    </div>
                  </div>
                  <div className="matches-badge">
                    <Trophy size={14} />
                    <span>{activeLeagues.length} activas</span>
                  </div>
                </div>

                <div className="matches-container">
                  {leagues.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">🏆</div>
                      <div className="matches-empty-text">No hay ligas disponibles</div>
                      <div className="matches-empty-subtext">Las nuevas ligas aparecerán aquí</div>
                    </div>
                  ) : (
                    leagues.map((league) => (
                      <LeagueCard
                        key={league.id}
                        league={league}
                        userPrediction={league.league_predictions?.find(
                          (p) => p.user_id === currentUser?.id
                        )}
                        onPredict={handleMakeLeaguePrediction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'awards' && (
              <div className="matches-section-premium">
                <div className="matches-header-premium">
                  <div className="matches-title-section">
                    <div className="matches-icon-wrapper">
                      <Trophy size={22} />
                    </div>
                    <div>
                      <h2 className="matches-title-premium">Premios Individuales</h2>
                      <p className="matches-subtitle-premium">Predice ganadores y gana puntos</p>
                    </div>
                  </div>
                  <div className="matches-badge">
                    <Trophy size={14} />
                    <span>{activeAwards.length} activos</span>
                  </div>
                </div>

                <div className="matches-container">
                  {awards.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">🥇</div>
                      <div className="matches-empty-text">No hay premios disponibles</div>
                      <div className="matches-empty-subtext">Los nuevos premios aparecerán aquí</div>
                    </div>
                  ) : (
                    awards.map((award) => (
                      <AwardCard
                        key={award.id}
                        award={award}
                        userPrediction={award.award_predictions?.find(
                          (p) => p.user_id === currentUser?.id
                        )}
                        onPredict={handleMakeAwardPrediction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </main>

        {isLoading && <LoadingOverlay message="Procesando..." />}
      </div>

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}
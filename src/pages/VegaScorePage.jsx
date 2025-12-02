// src/pages/VegaScorePage.jsx - VERSIÓN REFACTORIZADA
import React, { useState } from "react";
import { Trophy, TrendingUp, Target, Percent, Plus, CheckCircle, Shield, Star, Award as AwardIcon } from "lucide-react";

// Components
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";
import LeagueCard from "../components/LeagueCard";
import AwardCard from "../components/AwardCard";
import RankingSidebar from "../components/RankingSidebar";
import NavigationTabs from "../components/NavigationTabs";
import NavigationTabsTwo from "../components/NavigationTabsTwo";
import AdminModal from "../components/AdminModal";
import AdminLeagueModal from "../components/AdminLeagueModal";
import AdminAwardModal from "../components/AdminAwardModal";
import FinishLeagueModal from "../components/FinishLeagueModal";
import FinishAwardModal from "../components/FinishAwardModal";
import ProfilePage from "./ProfilePage";
import RankingPage from "./RankingPage";
import { PageLoader, LoadingOverlay } from "../components/LoadingStates";
import { ToastContainer, useToast } from "../components/Toast";

// Custom Hooks
import { useDataLoader } from "../hooks/useDataLoader";
import { useMatches } from "../hooks/useMatches";
import { useLeagues } from "../hooks/useLeagues";
import { useAwards } from "../hooks/useAwards";

// Styles
import "../styles/VegaScorePage.css";
import "../styles/AdminPanel.css";

export default function VegaScorePage() {
  // ========== STATE MANAGEMENT ==========
  const [showProfile, setShowProfile] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');
  const [rightTab, setRightTab] = useState('ranking');

  // Modales de Admin
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminLeagueModal, setShowAdminLeagueModal] = useState(false);
  const [showAdminAwardModal, setShowAdminAwardModal] = useState(false);
  const [showFinishLeagueModal, setShowFinishLeagueModal] = useState(false);
  const [showFinishAwardModal, setShowFinishAwardModal] = useState(false);
  const [leagueToFinish, setLeagueToFinish] = useState(null);
  const [awardToFinish, setAwardToFinish] = useState(null);

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

  const handleAddMatch = async (match) => {
    await addMatch(
      match,
      (data) => {
        updateMatches(data);
        toast.success("¡Partido agregado correctamente! ⚽");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  const handleSetMatchResult = async (matchId, homeScore, awayScore) => {
    await finishMatch(
      matchId,
      homeScore,
      awayScore,
      (result) => {
        updateUsers(result.users);
        updateMatches(result.matches);
        
        const { exactPredictions, correctResults } = result.stats;
        if (exactPredictions > 0 || correctResults > 0) {
          toast.success(`¡Partido finalizado! ${exactPredictions} exactas, ${correctResults} acertadas 🎉`);
        } else {
          toast.info("Partido finalizado. No hubo predicciones correctas.");
        }
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

  const handleAddLeague = async (league) => {
    await addLeague(
      league,
      (data) => {
        updateLeagues(data);
        toast.success("¡Liga agregada correctamente! 🏆");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  const handleFinishLeague = async (leagueId, results) => {
    await finishLeagueHook(
      leagueId,
      results,
      (result) => {
        updateUsers(result.users);
        updateLeagues(result.leagues);
        toast.success("¡Liga finalizada! Puntos distribuidos 🏆");
        setShowFinishLeagueModal(false);
        setLeagueToFinish(null);
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

  const handleAddAward = async (award) => {
    await addAward(
      award,
      (data) => {
        updateAwards(data);
        toast.success("¡Premio agregado correctamente! 🥇");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  const handleFinishAward = async (awardId, winner) => {
    await finishAwardHook(
      awardId,
      winner,
      (result) => {
        updateUsers(result.users);
        updateAwards(result.awards);
        toast.success("¡Premio finalizado! Puntos distribuidos 🥇");
        setShowFinishAwardModal(false);
        setAwardToFinish(null);
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  // ========== HANDLERS - ADMIN ==========
  const handleQuickFinishMatch = (matchId) => {
    const h = prompt("Goles equipo local:");
    if (h === null) return;
    const a = prompt("Goles equipo visitante:");
    if (a === null) return;
    const homeScore = parseInt(h);
    const awayScore = parseInt(a);
    if (isNaN(homeScore) || isNaN(awayScore)) {
      toast.warning("Por favor ingresa números válidos");
      return;
    }
    handleSetMatchResult(matchId, homeScore, awayScore);
  };

  const handlePromptFinishMatch = () => {
    const id = prompt("ID del partido a finalizar:");
    if (!id) return;
    const match = matches.find(m => m.id === id);
    if (!match) {
      toast.warning("Partido no encontrado");
      return;
    }
    handleQuickFinishMatch(id);
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

  // Mostrar perfil
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

  // Mostrar ranking
  if (showRanking) {
    return (
      <>
        <RankingPage 
          currentUser={currentUser} 
          onBack={() => setShowRanking(false)}
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
        <Header
          currentUser={currentUser}
          users={sortedUsers}
          onProfileClick={() => setShowProfile(true)}
          onRankingClick={() => setShowRanking(true)}
        />

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

          {/* --- Main Grid --- */}
          <section className="main-grid">
            <div className="left-col">
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
                      <Star size={14} />
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
            </div>

            <aside className={`right-col ${!currentUser?.is_admin ? 'single-column' : ''}`}>
              {currentUser?.is_admin && (
                <NavigationTabsTwo 
                  activeTab={rightTab} 
                  onTabChange={setRightTab}
                  isAdmin={currentUser?.is_admin}
                />
              )}

              {(rightTab === 'ranking' || !currentUser?.is_admin) && (
                <RankingSidebar users={sortedUsers} />
              )}

              {rightTab === 'admin' && currentUser?.is_admin && (
                <div className="admin-panel-premium">
                  <div className="admin-header">
                    <div className="admin-title-section">
                      <div className="admin-icon-wrapper">
                        <Shield size={20} />
                      </div>
                      <div>
                        <h3 className="admin-title">Panel Admin</h3>
                        <p className="admin-subtitle">Gestión completa</p>
                      </div>
                    </div>
                    <div className="admin-badge-active">
                      <span>Activo</span>
                    </div>
                  </div>

                  <div className="admin-stats-grid">
                    <div className="admin-stat-item">
                      <div className="admin-stat-icon pending">
                        <CheckCircle size={16} />
                      </div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Partidos</span>
                        <span className="admin-stat-value">
                          {pendingMatches.length}
                        </span>
                      </div>
                    </div>

                    <div className="admin-stat-item">
                      <div className="admin-stat-icon finished">
                        <CheckCircle size={16} />
                      </div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Ligas</span>
                        <span className="admin-stat-value">
                          {activeLeagues.length}
                        </span>
                      </div>
                    </div>

                    <div className="admin-stat-item">
                      <div className="admin-stat-icon awards">
                        <AwardIcon size={16} />
                      </div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Premios</span>
                        <span className="admin-stat-value">
                          {activeAwards.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-actions">
                    <button 
                      className="admin-btn primary"
                      onClick={() => setShowAdminModal(true)}
                    >
                      <Plus size={18} />
                      <span>Agregar Partido</span>
                      <div className="btn-shine"></div>
                    </button>

                    <button 
                      className="admin-btn primary"
                      onClick={() => setShowAdminLeagueModal(true)}
                    >
                      <Plus size={18} />
                      <span>Agregar Liga</span>
                      <div className="btn-shine"></div>
                    </button>

                    <button 
                      className="admin-btn primary"
                      onClick={() => setShowAdminAwardModal(true)}
                    >
                      <Plus size={18} />
                      <span>Agregar Premio</span>
                      <div className="btn-shine"></div>
                    </button>

                    <button
                      className="admin-btn secondary"
                      onClick={handlePromptFinishMatch}
                    >
                      <CheckCircle size={18} />
                      <span>Finalizar Partido</span>
                    </button>
                  </div>

                  <div className="admin-quick-matches">
                    <div className="admin-section-title">
                      <span>Partidos Pendientes</span>
                    </div>
                    {pendingMatches.slice(0, 3).map(match => (
                      <div key={match.id} className="admin-match-quick">
                        <div className="admin-match-info">
                          <span className="admin-match-teams">
                            {match.home_team} vs {match.away_team}
                          </span>
                          <span className="admin-match-id">{new Date(match.date).toLocaleDateString()}</span>
                        </div>
                        <button
                          className="admin-quick-btn"
                          onClick={() => handleQuickFinishMatch(match.id)}
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    ))}

                    {pendingMatches.length === 0 && (
                      <div className="admin-empty-state">
                        <span>No hay partidos pendientes</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-quick-matches">
                    <div className="admin-section-title">
                      <span>Ligas Activas</span>
                    </div>
                    {leagues.filter(l => l.status === 'active').slice(0, 3).map(league => (
                      <div key={league.id} className="admin-match-quick">
                        <div className="admin-match-info">
                          <span className="admin-match-teams">
                            {league.logo} {league.name}
                          </span>
                          <span className="admin-match-id">{league.season}</span>
                        </div>
                        <button
                          className="admin-quick-btn"
                          onClick={() => {
                            setLeagueToFinish(league);
                            setShowFinishLeagueModal(true);
                          }}
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    ))}

                    {activeLeagues.length === 0 && (
                      <div className="admin-empty-state">
                        <span>No hay ligas activas</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-quick-matches" style={{ marginTop: 12 }}>
                    <div className="admin-section-title">
                      <span>Premios Activos</span>
                    </div>
                    {awards.filter(a => a.status === 'active').slice(0, 3).map(a => (
                      <div key={a.id} className="admin-match-quick">
                        <div className="admin-match-info">
                          <span className="admin-match-teams">
                            {a.logo} {a.name}
                          </span>
                          <span className="admin-match-id">{a.season}</span>
                        </div>
                        <button
                          className="admin-quick-btn"
                          onClick={() => {
                            setAwardToFinish(a);
                            setShowFinishAwardModal(true);
                          }}
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    ))}

                    {activeAwards.length === 0 && (
                      <div className="admin-empty-state">
                        <span>No hay premios activos</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </section>
        </main>

        {/* Modales */}
        {showAdminModal && (
          <AdminModal onAdd={handleAddMatch} onClose={() => setShowAdminModal(false)} />
        )}

        {showAdminLeagueModal && (
          <AdminLeagueModal 
            onAdd={handleAddLeague} 
            onClose={() => setShowAdminLeagueModal(false)} 
          />
        )}

        {showAdminAwardModal && (
          <AdminAwardModal 
            onAdd={handleAddAward}
            onClose={() => setShowAdminAwardModal(false)}
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

        {showFinishAwardModal && awardToFinish && (
          <FinishAwardModal
            award={awardToFinish}
            onFinish={handleFinishAward}
            onClose={() => {
              setShowFinishAwardModal(false);
              setAwardToFinish(null);
            }}
          />
        )}

        {isLoading && <LoadingOverlay message="Procesando..." />}
      </div>

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}
// src/pages/VegaScorePage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";
import RankingSidebar from "../components/RankingSidebar";
import UserModal from "../components/UserModal";
import AdminModal from "../components/AdminModal";
import "../index.css";

export default function VegaScorePage() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock initial data if storage is empty (keeps demo look similar to Figma)
  useEffect(() => {
    const load = async () => {
      try {
        const matchesRaw = localStorage.getItem("vegascore-matches");
        const usersRaw = localStorage.getItem("vegascore-users");
        const currentRaw = localStorage.getItem("vegascore-currentUser");

        if (matchesRaw) setMatches(JSON.parse(matchesRaw));
        else {
          const sample = [
            {
              id: "m1",
              league: "Bundesliga",
              homeTeam: "Bayern Munich",
              awayTeam: "Borussia Dortmund",
              homeTeamLogo: "🏠",
              awayTeamLogo: "✈️",
              date: "2025-11-30",
              time: "18:30",
              status: "pending",
              predictions: [],
              result: null,
            },
          ];
          setMatches(sample);
          localStorage.setItem("vegascore-matches", JSON.stringify(sample));
        }

        if (usersRaw) setUsers(JSON.parse(usersRaw));
        else {
          const sampleUsers = [
            { id: "u1", name: "Ana García", points: 132, predictions: 0, correct: 0 },
            { id: "u2", name: "Carlos M.", points: 145, predictions: 0, correct: 0 },
            { id: "u3", name: "Pedro López", points: 128, predictions: 0, correct: 0 },
            { id: "u4", name: "tian", points: 0, predictions: 0, correct: 0 },
          ];
          setUsers(sampleUsers);
          localStorage.setItem("vegascore-users", JSON.stringify(sampleUsers));
        }

        if (currentRaw) setCurrentUser(JSON.parse(currentRaw));
        else {
          const cu = { id: "u4", name: "tian", points: 0, predictions: 0, correct: 0 };
          setCurrentUser(cu);
          localStorage.setItem("vegascore-currentUser", JSON.stringify(cu));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const persist = (k, v) => {
    localStorage.setItem(k, JSON.stringify(v));
  };

  const createUser = (newUser) => {
    if (users.some((u) => u.name.toLowerCase() === newUser.name.toLowerCase())) {
      alert("Este usuario ya existe");
      return;
    }
    const updated = [...users, newUser];
    setUsers(updated);
    setCurrentUser(newUser);
    persist("vegascore-users", updated);
    persist("vegascore-currentUser", newUser);
  };

  const selectUser = (user) => {
    setCurrentUser(user);
    persist("vegascore-currentUser", user);
    setShowUserModal(false);
  };

  const addMatch = (match) => {
    const updated = [...matches, match];
    setMatches(updated);
    persist("vegascore-matches", updated);
    setShowAdminModal(false);
  };

  const makePrediction = (matchId, homeScore, awayScore) => {
    if (!currentUser) return alert("Selecciona un usuario primero");
    const updated = matches.map((m) => {
      if (m.id !== matchId) return m;
      const idx = m.predictions.findIndex((p) => p.userId === currentUser.id);
      const pred = { userId: currentUser.id, userName: currentUser.name, homeScore, awayScore };
      if (idx >= 0) m.predictions[idx] = pred;
      else m.predictions.push(pred);
      return m;
    });
    setMatches(updated);
    persist("vegascore-matches", updated);
  };

  const setMatchResult = (matchId, homeScore, awayScore) => {
    const updated = matches.map((m) => (m.id === matchId ? { ...m, result: { homeScore, awayScore }, status: "finished" } : m));
    setMatches(updated);
    persist("vegascore-matches", updated);
    calculatePoints(updated);
  };

  const calculatePoints = (matchesData) => {
    const map = {};
    users.forEach((u) => (map[u.id] = { points: 0, predictions: 0, correct: 0 }));
    matchesData.forEach((m) => {
      if (m.status !== "finished" || !m.result) return;
      m.predictions.forEach((p) => {
        if (!map[p.userId]) return;
        map[p.userId].predictions++;
        const outcome = Math.sign(m.result.homeScore - m.result.awayScore);
        const pout = Math.sign(p.homeScore - p.awayScore);
        if (p.homeScore === m.result.homeScore && p.awayScore === m.result.awayScore) {
          map[p.userId].points += 5;
          map[p.userId].correct++;
        } else if (outcome === pout) {
          map[p.userId].points += 3;
          map[p.userId].correct++;
        }
      });
    });
    const updatedUsers = users.map((u) => ({ ...u, points: map[u.id]?.points || 0, predictions: map[u.id]?.predictions || 0, correct: map[u.id]?.correct || 0 }));
    setUsers(updatedUsers);
    persist("vegascore-users", updatedUsers);
    if (currentUser) {
      const cu = updatedUsers.find((x) => x.id === currentUser.id);
      setCurrentUser(cu);
      persist("vegascore-currentUser", cu);
    }
  };

  const getUserPrediction = (match) => {
    if (!currentUser) return null;
    return match.predictions.find((p) => p.userId === currentUser.id) || null;
  };

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const pendingMatches = matches.filter((m) => m.status === "pending").sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  if (loading) return <div className="centered">Cargando...</div>;

  return (
    <div className="vega-root">
      <Header
        currentUser={currentUser}
        users={users}
        onOpenUserModal={() => setShowUserModal(true)}
        onToggleSettings={() => setShowSettings((s) => !s)}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      <main className="container">
        {/* Stats */}
        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Posición</div>
            <div className="stat-value">#{sortedUsers.findIndex((u) => u.id === (currentUser?.id || "")) + 1 || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Puntos</div>
            <div className="stat-value">{currentUser?.points ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Aciertos</div>
            <div className="stat-value">{currentUser?.correct ?? 0}/{currentUser?.predictions ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Precisión</div>
            <div className="stat-value">{currentUser && currentUser.predictions > 0 ? Math.round((currentUser.correct / currentUser.predictions) * 100) + "%" : "0%"}</div>
          </div>
        </section>

        {/* Main grid */}
        <section className="main-grid">
          <div className="left-col">
            <h2 className="section-title">Próximos Partidos</h2>
            <div className="matches-container">
              {pendingMatches.length === 0 ? <div className="card-empty">No hay partidos disponibles</div> : pendingMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  userPred={getUserPrediction(m)}
                  onPredict={makePrediction}
                />
              ))}
            </div>
          </div>

          <aside className="right-col">
            <RankingSidebar users={sortedUsers} />
            {/* admin quick actions */}
            <div className="admin-quick card muted">
              <button className="btn" onClick={() => setShowAdminModal(true)}>Agregar Partido</button>
              <button
                className="btn secondary"
                onClick={() => {
                  const id = prompt("ID del partido a finalizar:");
                  if (!id) return;
                  const h = prompt("Goles equipo local:");
                  const a = prompt("Goles equipo visitante:");
                  if (h !== null && a !== null) setMatchResult(id, parseInt(h), parseInt(a));
                }}
              >
                Finalizar Partido
              </button>
            </div>
          </aside>
        </section>
      </main>

      {showUserModal && <UserModal users={users} onSelect={selectUser} onCreate={createUser} onClose={() => setShowUserModal(false)} />}
      {showAdminModal && <AdminModal onAdd={addMatch} onClose={() => setShowAdminModal(false)} />}
    </div>
  );
}

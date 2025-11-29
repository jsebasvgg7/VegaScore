// src/pages/VegaScorePage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";
import RankingSidebar from "../components/RankingSidebar";
import UserModal from "../components/UserModal";
import AdminModal from "../components/AdminModal";
import { supabase } from "../utils/supabaseClient";
import "../index.css";

export default function VegaScorePage() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load authenticated user + Supabase data
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ Obtener usuario autenticado
        const { data: authUser } = await supabase.auth.getUser();
        if (!authUser?.user) {
          window.location.href = "/login";
          return;
        }

        // 2️⃣ Obtener perfil desde tabla "users"
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.user.id)
          .single();

        setCurrentUser(profile);

        // 3️⃣ Cargar tabla de usuarios (ranking)
        const { data: userList } = await supabase
          .from("users")
          .select("*")
          .order("points", { ascending: false });

        setUsers(userList || []);

        // 4️⃣ Cargar partidos
        const { data: matchList } = await supabase
          .from("matches")
          .select("*, predictions(*)");

        setMatches(matchList || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- LÓGICA ACTUALIZADA PARA SUPABASE ---
  const makePrediction = async (matchId, homeScore, awayScore) => {
    if (!currentUser) return;

    await supabase.from("predictions").upsert({
      match_id: matchId,
      user_id: currentUser.id,
      home_score: homeScore,
      away_score: awayScore,
    });

    // Recargar partidos
    const { data: matchList } = await supabase
      .from("matches")
      .select("*, predictions(*)");
    setMatches(matchList);
  };

  const addMatch = async (match) => {
    await supabase.from("matches").insert(match);

    const { data } = await supabase
      .from("matches")
      .select("*, predictions(*)");

    setMatches(data);
  };

  const setMatchResult = async (matchId, homeScore, awayScore) => {
    await supabase
      .from("matches")
      .update({
        result_home: homeScore,
        result_away: awayScore,
        status: "finished",
      })
      .eq("id", matchId);

    const { data } = await supabase
      .from("matches")
      .select("*, predictions(*)");

    setMatches(data);
    calculatePoints(data);
  };

  const calculatePoints = async (matchesData) => {
    const updates = {};

    users.forEach((u) => {
      updates[u.id] = { points: 0, predictions: 0, correct: 0 };
    });

    matchesData.forEach((m) => {
      if (m.status !== "finished") return;
      m.predictions.forEach((p) => {
        const user = updates[p.user_id];
        if (!user) return;

        user.predictions++;

        const realDiff = Math.sign(m.result_home - m.result_away);
        const predDiff = Math.sign(p.home_score - p.away_score);

        if (p.home_score === m.result_home && p.away_score === m.result_away) {
          user.points += 5;
          user.correct++;
        } else if (realDiff === predDiff) {
          user.points += 3;
          user.correct++;
        }
      });
    });

    // Guardar en Supabase
    for (const userId in updates) {
      await supabase.from("users").update(updates[userId]).eq("id", userId);
    }

    // Recargar usuarios
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("points", { ascending: false });

    setUsers(data);

    const cu = data.find((u) => u.id === currentUser.id);
    setCurrentUser(cu);
  };

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const pendingMatches = matches.filter((m) => m.status === "pending");

  if (loading) return <div className="centered">Cargando...</div>;

  return (
    <div className="vega-root">
      <Header
        currentUser={currentUser}
        users={users}
        onOpenUserModal={() => setShowUserModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      <main className="container">
        {/* --- Stats --- */}
        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Posición</div>
            <div className="stat-value">
              #{sortedUsers.findIndex((u) => u.id === currentUser?.id) + 1}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Puntos</div>
            <div className="stat-value">{currentUser?.points}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Aciertos</div>
            <div className="stat-value">
              {currentUser?.correct}/{currentUser?.predictions}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Precisión</div>
            <div className="stat-value">
              {currentUser?.predictions > 0
                ? Math.round((currentUser.correct / currentUser.predictions) * 100) + "%"
                : "0%"}
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="main-grid">
          <div className="left-col">
            <h2 className="section-title">Próximos Partidos</h2>

            <div className="matches-container">
              {pendingMatches.length === 0 ? (
                <div className="card-empty">No hay partidos disponibles</div>
              ) : (
                pendingMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    userPred={m.predictions?.find(
                      (p) => p.user_id === currentUser?.id
                    )}
                    onPredict={makePrediction}
                  />
                ))
              )}
            </div>
          </div>

          <aside className="right-col">
            <RankingSidebar users={sortedUsers} />
            <div className="admin-quick card muted">
              <button className="btn" onClick={() => setShowAdminModal(true)}>
                Agregar Partido
              </button>

              <button
                className="btn secondary"
                onClick={() => {
                  const id = prompt("ID del partido a finalizar:");
                  const h = prompt("Goles local:");
                  const a = prompt("Goles visitante:");
                  if (id && h && a) setMatchResult(id, parseInt(h), parseInt(a));
                }}
              >
                Finalizar Partido
              </button>
            </div>
          </aside>
        </section>
      </main>

      {showUserModal && (
        <UserModal
          users={users}
          onSelect={(u) => setCurrentUser(u)}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {showAdminModal && (
        <AdminModal
          onAdd={addMatch}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}

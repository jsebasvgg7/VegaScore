// src/pages/VegaScorePage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";
import RankingSidebar from "../components/RankingSidebar";
import AdminModal from "../components/AdminModal";
import { supabase } from "../utils/supabaseClient";
import "../index.css";

export default function VegaScorePage() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- CARGA INICIAL DE DATOS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ Obtener usuario autenticado
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (!authUser?.user) {
          window.location.href = "/";
          return;
        }

        console.log("Auth User ID:", authUser.user.id);

        // 2️⃣ Perfil del usuario autenticado (BUSCAR POR auth_id)
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", authUser.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error al cargar perfil:", profileError);
          alert(`Error al cargar perfil: ${profileError.message}`);
          return;
        }

        // Si no existe el perfil, crearlo automáticamente
        if (!profile) {
          console.log("Perfil no encontrado, creando uno nuevo...");
          
          const { data: newProfile, error: createError } = await supabase
            .from("users")
            .insert({
              auth_id: authUser.user.id,
              name: authUser.user.email?.split('@')[0] || "Usuario",
              points: 0,
              predictions: 0,
              correct: 0
            })
            .select()
            .single();

          if (createError) {
            console.error("Error al crear perfil:", createError);
            alert(`No se pudo crear tu perfil: ${createError.message}`);
            return;
          }

          console.log("Perfil creado:", newProfile);
          setCurrentUser(newProfile);
        } else {
          console.log("Perfil encontrado:", profile);
          setCurrentUser(profile);
        }

        // 3️⃣ Listado de todos los usuarios
        const { data: userList } = await supabase
          .from("users")
          .select("*")
          .order("points", { ascending: false });
        setUsers(userList || []);

        // 4️⃣ Cargar partidos con sus predicciones
        const { data: matchList } = await supabase
          .from("matches")
          .select("*, predictions(*)");
        setMatches(matchList || []);

      } catch (err) {
        console.error("Error en loadData:", err);
        alert(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- FUNCIONES DE INTERACCIÓN ---
  const makePrediction = async (matchId, homeScore, awayScore) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase.from("predictions").upsert({
        match_id: matchId,
        user_id: currentUser.id,
        home_score: homeScore,
        away_score: awayScore,
      }, {
        onConflict: 'match_id,user_id'
      });

      if (error) throw error;

      const { data: matchList } = await supabase
        .from("matches")
        .select("*, predictions(*)");
      setMatches(matchList);

      alert("¡Predicción guardada exitosamente!");
    } catch (err) {
      console.error("Error al guardar predicción:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const addMatch = async (match) => {
    try {
      const { error } = await supabase.from("matches").insert(match);
      if (error) throw error;

      const { data } = await supabase.from("matches").select("*, predictions(*)");
      setMatches(data);
      alert("¡Partido agregado!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const setMatchResult = async (matchId, homeScore, awayScore) => {
    try {
      await supabase
        .from("matches")
        .update({ 
          result_home: homeScore, 
          result_away: awayScore, 
          status: "finished" 
        })
        .eq("id", matchId);

      const { data } = await supabase.from("matches").select("*, predictions(*)");
      setMatches(data);
      await calculatePoints(data);
      alert("¡Partido finalizado y puntos calculados!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
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

    for (const userId in updates) {
      await supabase.from("users").update(updates[userId]).eq("id", userId);
    }

    const { data } = await supabase
      .from("users")
      .select("*")
      .order("points", { ascending: false });

    setUsers(data);
    setCurrentUser(data.find((u) => u.id === currentUser.id));
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="centered">
        <div>Cargando...</div>
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

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const pendingMatches = matches.filter((m) => m.status === "pending");

  return (
    <div className="vega-root">
      <Header
        currentUser={currentUser}
        users={users}
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
            <div className="stat-value">{currentUser?.points ?? 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Aciertos</div>
            <div className="stat-value">
              {currentUser?.correct ?? 0}/{currentUser?.predictions ?? 0}
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

        {/* --- Main Grid --- */}
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
            <div className="admin-quick card">
              <button className="btn" onClick={() => setShowAdminModal(true)}>
                ➕ Agregar Partido
              </button>

              <button
                className="btn secondary"
                style={{ marginTop: '8px' }}
                onClick={() => {
                  const id = prompt("ID del partido a finalizar:");
                  const h = prompt("Goles local:");
                  const a = prompt("Goles visitante:");
                  if (id && h && a) setMatchResult(id, parseInt(h), parseInt(a));
                }}
              >
                ✅ Finalizar Partido
              </button>
            </div>
          </aside>
        </section>
      </main>

      {showAdminModal && (
        <AdminModal onAdd={addMatch} onClose={() => setShowAdminModal(false)} />
      )}
    </div>
  );
}
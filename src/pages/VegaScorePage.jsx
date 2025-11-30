// src/pages/VegaScorePage.jsx
import React, { useEffect, useState } from "react";
import { Trophy, TrendingUp, Target, Percent, Plus, CheckCircle, Shield } from "lucide-react";
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
      console.log(`🎯 Finalizando partido ${matchId}: ${homeScore}-${awayScore}`);

      // 1️⃣ Actualizar el resultado del partido
      const { error: updateError } = await supabase
        .from("matches")
        .update({ 
          result_home: homeScore, 
          result_away: awayScore, 
          status: "finished" 
        })
        .eq("id", matchId);

      if (updateError) throw updateError;

      // 2️⃣ Obtener el partido actualizado con todas sus predicciones
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("*, predictions(*)")
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      console.log(`📊 Partido encontrado con ${match.predictions.length} predicciones`);

      // 3️⃣ Calcular puntos para cada predicción
      const resultDiff = Math.sign(homeScore - awayScore); // 1=local, 0=empate, -1=visitante

      for (const prediction of match.predictions) {
        const predDiff = Math.sign(prediction.home_score - prediction.away_score);
        let pointsEarned = 0;

        // Resultado exacto = 5 puntos
        if (prediction.home_score === homeScore && prediction.away_score === awayScore) {
          pointsEarned = 5;
          console.log(`✅ Usuario ${prediction.user_id}: Resultado exacto (+5 pts)`);
        } 
        // Acertó ganador/empate = 3 puntos
        else if (resultDiff === predDiff) {
          pointsEarned = 3;
          console.log(`✅ Usuario ${prediction.user_id}: Acertó resultado (+3 pts)`);
        } else {
          console.log(`❌ Usuario ${prediction.user_id}: No acertó (0 pts)`);
        }

        // 4️⃣ Obtener estadísticas actuales del usuario
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("points, predictions, correct")
          .eq("id", prediction.user_id)
          .single();

        if (userError) {
          console.error(`Error al obtener usuario ${prediction.user_id}:`, userError);
          continue;
        }

        // 5️⃣ Calcular nuevas estadísticas
        const newPoints = (userData.points || 0) + pointsEarned;
        const newPredictions = (userData.predictions || 0) + 1;
        const newCorrect = (userData.correct || 0) + (pointsEarned > 0 ? 1 : 0);

        console.log(`📈 Actualizando usuario ${prediction.user_id}:`, {
          points: `${userData.points} → ${newPoints}`,
          predictions: `${userData.predictions} → ${newPredictions}`,
          correct: `${userData.correct} → ${newCorrect}`
        });

        // 6️⃣ Actualizar estadísticas del usuario
        const { error: updateUserError } = await supabase
          .from("users")
          .update({
            points: newPoints,
            predictions: newPredictions,
            correct: newCorrect
          })
          .eq("id", prediction.user_id);

        if (updateUserError) {
          console.error(`Error al actualizar usuario ${prediction.user_id}:`, updateUserError);
        }
      }

      // 7️⃣ Recargar todos los datos actualizados
      const { data: updatedUsers } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      const { data: updatedMatches } = await supabase
        .from("matches")
        .select("*, predictions(*)");

      setUsers(updatedUsers || []);
      setMatches(updatedMatches || []);
      
      // Actualizar el usuario actual
      const updatedCurrentUser = updatedUsers?.find(u => u.id === currentUser.id);
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
      }

      console.log("✅ Partido finalizado y estadísticas actualizadas");
      alert("¡Partido finalizado! Los puntos han sido calculados y actualizados.");

    } catch (err) {
      console.error("Error al finalizar partido:", err);
      alert(`Error: ${err.message}`);
    }
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
        users={sortedUsers}
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
            
            {/* Panel de administración - Solo visible para admins */}
            {currentUser?.is_admin && (
              <div className="admin-quick card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Shield size={18} color="#ff8a00" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Panel Admin</h3>
                </div>
                
                <button className="btn" onClick={() => setShowAdminModal(true)}>
                  <Plus size={18} style={{ marginRight: '8px' }} />
                  Agregar Partido
                </button>

                <button
                  className="btn secondary"
                  style={{ marginTop: '8px' }}
                  onClick={() => {
                    const id = prompt("ID del partido a finalizar:");
                    if (!id) return;
                    
                    const h = prompt("Goles equipo local:");
                    if (h === null) return;
                    
                    const a = prompt("Goles equipo visitante:");
                    if (a === null) return;
                    
                    const homeScore = parseInt(h);
                    const awayScore = parseInt(a);
                    
                    if (isNaN(homeScore) || isNaN(awayScore)) {
                      alert("Por favor ingresa números válidos");
                      return;
                    }
                    
                    setMatchResult(id, homeScore, awayScore);
                  }}
                >
                  <CheckCircle size={18} style={{ marginRight: '8px' }} />
                  Finalizar Partido
                </button>
              </div>
            )}
          </aside>
        </section>
      </main>

      {showAdminModal && (
        <AdminModal onAdd={addMatch} onClose={() => setShowAdminModal(false)} />
      )}
    </div>
  );
}
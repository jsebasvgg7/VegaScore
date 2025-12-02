import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

/**
 * Custom Hook para encapsular toda la lógica de predicciones y administración.
 * @param {object} currentUser - El perfil del usuario actual (de useAuth).
 * @param {object} toast - La instancia de useToast para notificaciones.
 * @param {function} refreshData - Función para recargar todos los datos del dashboard.
 */
export function usePredictionActions(currentUser, toast, refreshData) {
  const [actionLoading, setActionLoading] = useState(false);
  
  // --- HELPERS PARA RECARGA DE DATOS ESPECÍFICOS ---
  // Esto asegura que solo recargamos las tablas que se vieron afectadas.
  const refreshMatches = async () => {
    const { data } = await supabase.from("matches").select("*, predictions(*)");
    return data;
  };

  const refreshLeagues = async () => {
    const { data } = await supabase.from("leagues").select("*, league_predictions(*)");
    return data;
  };
  
  const refreshAwards = async () => {
    const { data } = await supabase.from("awards").select("*, award_predictions(*)");
    return data;
  };

  // --- FUNCIONES DE ACCIÓN (USER & ADMIN) ---
  
  // 1. PREDICCIÓN DE PARTIDO (USER)
  const makePrediction = async (matchId, homeScore, awayScore, matches, setMatches) => {
    if (!currentUser) return;

    const match = matches.find(m => m.id === matchId);
    if (match?.deadline) {
      const now = new Date();
      const deadline = new Date(match.deadline);
      if (now > deadline) {
        toast.warning("El tiempo para hacer predicciones ha expirado");
        return;
      }
    }

    setActionLoading(true);
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

      const updatedMatches = await refreshMatches();
      setMatches(updatedMatches);

      toast.success("¡Predicción guardada exitosamente! 🎯");
    } catch (err) {
      console.error("Error al guardar predicción:", err);
      toast.error(`Error al guardar: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. AGREGAR PARTIDO (ADMIN)
  const addMatch = async (match, setMatches) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from("matches").insert(match);
      if (error) throw error;

      const updatedMatches = await refreshMatches();
      setMatches(updatedMatches);
      
      toast.success("¡Partido agregado correctamente! ⚽");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. FINALIZAR PARTIDO (ADMIN) - FUNCIÓN CRÍTICA
  const setMatchResult = async (matchId, homeScore, awayScore) => {
    setActionLoading(true);
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

      // 3️⃣ Calcular puntos para cada predicción (Lógica compleja mantenida)
      const resultDiff = Math.sign(homeScore - awayScore);
      let exactPredictions = 0;
      let correctResults = 0;

      for (const prediction of match.predictions) {
        const predDiff = Math.sign(prediction.home_score - prediction.away_score);
        let pointsEarned = 0;

        if (prediction.home_score === homeScore && prediction.away_score === awayScore) {
          pointsEarned = 5;
          exactPredictions++;
        } else if (resultDiff === predDiff) {
          pointsEarned = 3;
          correctResults++;
        }

        const { data: userData } = await supabase
          .from("users")
          .select("points, predictions, correct")
          .eq("id", prediction.user_id)
          .single();

        if (userData) {
          const newPoints = (userData.points || 0) + pointsEarned;
          const newPredictions = (userData.predictions || 0) + 1;
          const newCorrect = (userData.correct || 0) + (pointsEarned > 0 ? 1 : 0);

          await supabase
            .from("users")
            .update({
              points: newPoints,
              predictions: newPredictions,
              correct: newCorrect
            })
            .eq("id", prediction.user_id);
        }
      }

      // 4️⃣ Recargar todos los datos de la app (para actualizar el ranking y partidos)
      await refreshData();
      
      if (exactPredictions > 0 || correctResults > 0) {
        toast.success(`¡Partido finalizado! ${exactPredictions} exactas, ${correctResults} acertadas 🎉`);
      } else {
        toast.info("Partido finalizado. No hubo predicciones correctas.");
      }

    } catch (err) {
      console.error("Error al finalizar partido:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. PREDICCIÓN DE LIGA (USER)
  const makeLeaguePrediction = async (leagueId, champion, topScorer, topAssist, mvp, setLeagues) => {
    if (!currentUser) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.from("league_predictions").upsert({
        league_id: leagueId,
        user_id: currentUser.id,
        predicted_champion: champion,
        predicted_top_scorer: topScorer,
        predicted_top_assist: topAssist,
        predicted_mvp: mvp,
      }, {
        onConflict: 'league_id,user_id'
      });

      if (error) throw error;

      const updatedLeagues = await refreshLeagues();
      setLeagues(updatedLeagues);

      toast.success("¡Predicción de liga guardada exitosamente! 🏆");
    } catch (err) {
      console.error("Error al guardar predicción de liga:", err);
      toast.error(`Error al guardar: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. AGREGAR LIGA (ADMIN)
  const addLeague = async (league, setLeagues) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from("leagues").insert(league);
      if (error) throw error;

      const updatedLeagues = await refreshLeagues();
      setLeagues(updatedLeagues);
      
      toast.success("¡Liga agregada correctamente! 🏆");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 6. FINALIZAR LIGA (ADMIN) - FUNCIÓN CRÍTICA
  const finishLeague = async (leagueId, results) => {
    setActionLoading(true);
    try {
      // 1️⃣ Actualizar la liga con los resultados
      const { error: updateError } = await supabase
        .from("leagues")
        .update({ 
          status: "finished",
          champion: results.champion,
          top_scorer: results.top_scorer,
          top_scorer_goals: results.top_scorer_goals,
          top_assist: results.top_assist,
          top_assist_count: results.top_assist_count,
          mvp_player: results.mvp_player
        })
        .eq("id", leagueId);

      if (updateError) throw updateError;

      // 2️⃣ Obtener la liga con todas sus predicciones
      const { data: league } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)")
        .eq("id", leagueId)
        .single();
      
      // 3️⃣ Calcular puntos para cada predicción (5 puntos por cada predicción correcta)
      for (const prediction of league.league_predictions) {
        let pointsEarned = 0;

        if (prediction.predicted_champion?.toLowerCase() === results.champion.toLowerCase()) { pointsEarned += 5; }
        if (prediction.predicted_top_scorer?.toLowerCase() === results.top_scorer.toLowerCase()) { pointsEarned += 5; }
        if (prediction.predicted_top_assist?.toLowerCase() === results.top_assist.toLowerCase()) { pointsEarned += 5; }
        if (prediction.predicted_mvp?.toLowerCase() === results.mvp_player.toLowerCase()) { pointsEarned += 5; }

        // Actualizar points_earned en la predicción de liga
        await supabase
          .from("league_predictions")
          .update({ points_earned: pointsEarned })
          .eq("id", prediction.id);

        // Actualizar puntos del usuario
        const { data: userData } = await supabase
          .from("users")
          .select("points")
          .eq("id", prediction.user_id)
          .single();

        if (userData) {
          const newPoints = (userData.points || 0) + pointsEarned;
          await supabase
            .from("users")
            .update({ points: newPoints })
            .eq("id", prediction.user_id);
        }
      }

      // 4️⃣ Recargar todos los datos de la app
      await refreshData();
      
      toast.success("¡Liga finalizada! Puntos distribuidos 🏆");
      // Notificación de que el modal debe cerrarse (se manejará en el componente Admin)

    } catch (err) {
      console.error("Error al finalizar liga:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 7. PREDICCIÓN DE PREMIO (USER)
  const makeAwardPrediction = async (awardId, predictedWinner, setAwards) => {
    if (!currentUser) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.from("award_predictions").upsert({
        award_id: awardId,
        user_id: currentUser.id,
        predicted_winner: predictedWinner,
      }, {
        onConflict: 'award_id,user_id'
      });

      if (error) throw error;

      const updatedAwards = await refreshAwards();
      setAwards(updatedAwards);

      toast.success("¡Predicción guardada exitosamente! 🏆");
    } catch (err) {
      console.error("Error al guardar predicción de premio:", err);
      toast.error(`Error al guardar: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 8. AGREGAR PREMIO (ADMIN)
  const addAward = async (award, setAwards) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from("awards").insert(award);
      if (error) throw error;

      const updatedAwards = await refreshAwards();
      setAwards(updatedAwards);

      toast.success("¡Premio agregado correctamente! 🥇");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 9. FINALIZAR PREMIO (ADMIN) - FUNCIÓN CRÍTICA
  const finishAward = async (awardId, winner) => {
    setActionLoading(true);
    try {
      // 1️⃣ Actualizar el premio con el ganador y estado
      const { error: updateError } = await supabase
        .from("awards")
        .update({ status: "finished", winner })
        .eq("id", awardId);

      if (updateError) throw updateError;

      // 2️⃣ Obtener el premio con todas sus predicciones
      const { data: award } = await supabase
        .from("awards")
        .select("*, award_predictions(*)")
        .eq("id", awardId)
        .single();
      
      // 3️⃣ Repartir puntos (10 puntos por acierto)
      for (const prediction of award.award_predictions) {
        let pointsEarned = 0;

        if (prediction.predicted_winner?.toLowerCase() === winner.toLowerCase()) {
          pointsEarned = 10;
        }

        // Actualizar points_earned en la predicción
        await supabase
          .from("award_predictions")
          .update({ points_earned: pointsEarned })
          .eq("id", prediction.id);

        // Actualizar puntos y contadores del usuario
        const { data: userData } = await supabase
          .from("users")
          .select("points, predictions, correct")
          .eq("id", prediction.user_id)
          .single();

        if (userData) {
          const newPoints = (userData.points || 0) + pointsEarned;
          const newPredictions = (userData.predictions || 0) + 1;
          const newCorrect = (userData.correct || 0) + (pointsEarned > 0 ? 1 : 0);

          await supabase
            .from("users")
            .update({
              points: newPoints,
              predictions: newPredictions,
              correct: newCorrect
            })
            .eq("id", prediction.user_id);
        }
      }

      // 4️⃣ Recargar todos los datos de la app
      await refreshData();

      toast.success("¡Premio finalizado! Puntos distribuidos 🥇");
    } catch (err) {
      console.error("Error al finalizar premio:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };


  return {
    actionLoading,
    makePrediction,
    addMatch,
    setMatchResult,
    makeLeaguePrediction,
    addLeague,
    finishLeague,
    makeAwardPrediction,
    addAward,
    finishAward,
  };
}
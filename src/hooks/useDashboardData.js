// src/hooks/useDashboardData.js

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";

export function useDashboardData() {
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Listado de todos los usuarios (Ranking)
      const { data: userList, error: userError } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });
      if (userError) throw userError;
      setUsers(userList || []);

      // 2. Partidos con predicciones
      const { data: matchList, error: matchError } = await supabase
        .from("matches")
        .select("*, predictions(*)");
      if (matchError) throw matchError;
      setMatches(matchList || []);

      // 3. Ligas con predicciones
      const { data: leagueList, error: leagueError } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)");
      if (leagueError) throw leagueError;
      setLeagues(leagueList || []);

      // 4. Premios individuales con predicciones
      const { data: awardList, error: awardError } = await supabase
        .from("awards")
        .select("*, award_predictions(*)");
      if (awardError) throw awardError;
      setAwards(awardList || []);

    } catch (err) {
      console.error("Error al cargar datos del Dashboard:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    matches,
    leagues,
    awards,
    users,
    loading,
    error,
    refreshData: loadAllData, // Función para recargar datos
    setMatches, // Necesario para actualizar después de predecir
    setLeagues,
    setAwards,
    setUsers,
  };
}
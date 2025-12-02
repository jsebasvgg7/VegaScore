import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useRanking(filter = "global") {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRanking();
  }, [filter]);

  const loadRanking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      // Si el filtro es mensual, podrías agregar lógica adicional aquí
      // Por ahora, simplemente cargamos todos los usuarios ordenados por puntos

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setRanking(data || []);
    } catch (err) {
      console.error("Error loading ranking:", err);
      setError(err.message);
      setRanking([]); // Array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  return { 
    ranking: ranking || [], // Siempre retornar un array
    loading, 
    error,
    reload: loadRanking 
  };
}
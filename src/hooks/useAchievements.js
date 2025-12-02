// src/hooks/useAchievements.js
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar logros disponibles
  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('available_achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (fetchError) throw fetchError;

      setAchievements(data || []);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError(err.message);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar títulos disponibles
  const loadTitles = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('available_titles')
        .select('*');

      if (fetchError) throw fetchError;

      setTitles(data || []);
    } catch (err) {
      console.error('Error loading titles:', err);
      setTitles([]);
    }
  };

  // Crear nuevo logro (admin)
  const createAchievement = async (achievementData) => {
    try {
      const { data, error: insertError } = await supabase
        .from('available_achievements')
        .insert(achievementData)
        .select()
        .single();

      if (insertError) throw insertError;

      await loadAchievements();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating achievement:', err);
      return { success: false, error: err.message };
    }
  };

  // Actualizar logro (admin)
  const updateAchievement = async (id, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('available_achievements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await loadAchievements();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating achievement:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar logro (admin)
  const deleteAchievement = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('available_achievements')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await loadAchievements();
      return { success: true };
    } catch (err) {
      console.error('Error deleting achievement:', err);
      return { success: false, error: err.message };
    }
  };

  // Crear nuevo título (admin)
  const createTitle = async (titleData) => {
    try {
      const { data, error: insertError } = await supabase
        .from('available_titles')
        .insert(titleData)
        .select()
        .single();

      if (insertError) throw insertError;

      await loadTitles();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating title:', err);
      return { success: false, error: err.message };
    }
  };

  // Actualizar título (admin)
  const updateTitle = async (id, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('available_titles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await loadTitles();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating title:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar título (admin)
  const deleteTitle = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('available_titles')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await loadTitles();
      return { success: true };
    } catch (err) {
      console.error('Error deleting title:', err);
      return { success: false, error: err.message };
    }
  };

  // Verificar y desbloquear logros para un usuario
  const checkAndUnlockAchievements = async (userId, userStats) => {
    try {
      // Obtener logros del usuario
      const { data: userData } = await supabase
        .from('users')
        .select('achievements')
        .eq('id', userId)
        .single();

      const unlockedAchievements = userData?.achievements || [];
      const newUnlocks = [];

      // Verificar cada logro disponible
      for (const achievement of achievements) {
        if (!unlockedAchievements.includes(achievement.id)) {
          const meetsRequirement = checkRequirement(achievement, userStats);
          if (meetsRequirement) {
            newUnlocks.push(achievement.id);
          }
        }
      }

      // Actualizar logros desbloqueados
      if (newUnlocks.length > 0) {
        const updatedAchievements = [...unlockedAchievements, ...newUnlocks];
        await supabase
          .from('users')
          .update({ achievements: updatedAchievements })
          .eq('id', userId);

        return { success: true, newUnlocks };
      }

      return { success: true, newUnlocks: [] };
    } catch (err) {
      console.error('Error checking achievements:', err);
      return { success: false, error: err.message };
    }
  };

  // Verificar si se cumple el requisito de un logro
  const checkRequirement = (achievement, stats) => {
    const { requirement_type, requirement_value } = achievement;
    
    switch (requirement_type) {
      case 'points':
        return stats.points >= requirement_value;
      case 'predictions':
        return stats.predictions >= requirement_value;
      case 'correct':
        return stats.correct >= requirement_value;
      case 'streak':
        return (stats.best_streak || 0) >= requirement_value;
      default:
        return false;
    }
  };

  // Calcular progreso de un logro
  const calculateProgress = (achievement, stats) => {
    const { requirement_type, requirement_value } = achievement;
    let current = 0;

    switch (requirement_type) {
      case 'points':
        current = stats.points || 0;
        break;
      case 'predictions':
        current = stats.predictions || 0;
        break;
      case 'correct':
        current = stats.correct || 0;
        break;
      case 'streak':
        current = stats.best_streak || 0;
        break;
    }

    return Math.min(100, (current / requirement_value) * 100);
  };

  useEffect(() => {
    loadAchievements();
    loadTitles();
  }, []);

  return {
    achievements,
    titles,
    loading,
    error,
    loadAchievements,
    loadTitles,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    createTitle,
    updateTitle,
    deleteTitle,
    checkAndUnlockAchievements,
    checkRequirement,
    calculateProgress,
  };
}
// src/components/AchievementsSection.jsx
import React, { useState, useEffect } from 'react';
import { Trophy, Award, Lock, Star, TrendingUp } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function AchievementsSection({ userId, userStats }) {
  const [achievements, setAchievements] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAchievementsAndTitles();
    }
  }, [userId, userStats]);

  const loadAchievementsAndTitles = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Cargar logros disponibles
      const { data: availableAchievements } = await supabase
        .from('available_achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      // Cargar títulos disponibles
      const { data: availableTitles } = await supabase
        .from('available_titles')
        .select('*');

      // Cargar logros desbloqueados del usuario
      const { data: userData } = await supabase
        .from('users')
        .select('achievements, titles')
        .eq('id', userId)
        .single();

      const unlockedAchievements = userData?.achievements || [];
      const unlockedTitles = userData?.titles || [];

      // Crear stats con valores por defecto
      const stats = {
        points: userStats?.points || 0,
        predictions: userStats?.predictions || 0,
        correct: userStats?.correct || 0,
        best_streak: userStats?.best_streak || 0
      };

      // Verificar y desbloquear nuevos logros
      const newUnlocks = [];
      (availableAchievements || []).forEach(achievement => {
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        const meetsRequirement = checkRequirement(achievement, stats);
        
        if (!isUnlocked && meetsRequirement) {
          newUnlocks.push(achievement.id);
        }
      });

      // Actualizar logros desbloqueados en la base de datos
      if (newUnlocks.length > 0) {
        const updatedAchievements = [...unlockedAchievements, ...newUnlocks];
        await supabase
          .from('users')
          .update({ achievements: updatedAchievements })
          .eq('id', userId);
      }

      // Marcar logros como desbloqueados o bloqueados
      const processedAchievements = (availableAchievements || []).map(achievement => ({
        ...achievement,
        unlocked: unlockedAchievements.includes(achievement.id) || newUnlocks.includes(achievement.id),
        progress: calculateProgress(achievement, stats)
      }));

      const processedTitles = (availableTitles || []).map(title => ({
        ...title,
        unlocked: unlockedTitles.includes(title.id)
      }));

      setAchievements(processedAchievements);
      setTitles(processedTitles);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setAchievements([]);
      setTitles([]);
    } finally {
      setLoading(false);
    }
  };

  const checkRequirement = (achievement, stats) => {
    const { requirement_type, requirement_value } = achievement;
    
    switch (requirement_type) {
      case 'points':
        return (stats.points || 0) >= requirement_value;
      case 'predictions':
        return (stats.predictions || 0) >= requirement_value;
      case 'correct':
        return (stats.correct || 0) >= requirement_value;
      case 'streak':
        return (stats.best_streak || 0) >= requirement_value;
      default:
        return false;
    }
  };

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

  if (loading) {
    return (
      <div className="achievements-loading">
        <div className="spinner"></div>
        <p>Cargando logros...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="achievements-loading">
        <p>Inicia sesión para ver tus logros</p>
      </div>
    );
  }

  return (
    <div className="achievements-section">
      <style>{`
        .achievements-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .achievements-loading {
          text-align: center;
          padding: 48px;
          color: #999;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top-color: #60519b;
          border-radius: 50%;
          margin: 0 auto 16px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e202c;
          margin: 0;
        }

        .section-count {
          background: rgba(96, 81, 155, 0.1);
          color: #60519b;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
        }

        /* Logros Grid */
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }

        .achievement-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          border: 2px solid transparent;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .achievement-card.unlocked {
          border-color: rgba(96, 81, 155, 0.3);
          background: linear-gradient(135deg, #ffffff 0%, #f3f0ff 100%);
        }

        .achievement-card.locked {
          opacity: 0.6;
          filter: grayscale(0.8);
        }

        .achievement-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .achievement-icon {
          font-size: 48px;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
        }

        .achievement-card.locked .achievement-icon {
          position: relative;
        }

        .lock-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.6);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .achievement-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .achievement-name {
          font-size: 14px;
          font-weight: 700;
          color: #111;
        }

        .achievement-description {
          font-size: 11px;
          color: #888;
        }

        .achievement-category {
          font-size: 10px;
          color: #60519b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .achievement-progress {
          width: 100%;
          height: 4px;
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 8px;
        }

        .achievement-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #60519b, #8b7fc7);
          border-radius: 10px;
          transition: width 0.5s ease;
        }

        /* Títulos Grid */
        .titles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .title-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 2px solid transparent;
          transition: all 0.3s;
        }

        .title-card.unlocked {
          border-color: rgba(96, 81, 155, 0.3);
          background: linear-gradient(135deg, #ffffff 0%, #f3f0ff 100%);
        }

        .title-card.locked {
          opacity: 0.6;
        }

        .title-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .title-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }

        .title-card.unlocked .title-icon-wrapper {
          background: linear-gradient(135deg, #60519b 0%, #8b7fc7 100%);
          color: white;
        }

        .title-card.locked .title-icon-wrapper {
          background: #f0f0f0;
          color: #999;
        }

        .title-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .title-name {
          font-size: 16px;
          font-weight: 700;
          color: #111;
        }

        .title-description {
          font-size: 12px;
          color: #888;
        }

        .title-badge {
          align-self: flex-start;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .title-card.unlocked .title-badge {
          background: rgba(96, 81, 155, 0.15);
          color: #60519b;
        }

        .title-card.locked .title-badge {
          background: #f0f0f0;
          color: #999;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .achievements-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          }

          .achievement-card {
            padding: 16px;
          }

          .achievement-icon {
            font-size: 40px;
          }

          .titles-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .achievements-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .achievement-card {
            padding: 14px;
          }

          .achievement-icon {
            font-size: 36px;
          }

          .achievement-name {
            font-size: 13px;
          }

          .achievement-description {
            font-size: 10px;
          }
        }
      `}</style>

      {/* Sección de Logros */}
      <div className="achievements-container">
        <div className="section-header">
          <Trophy size={24} style={{ color: '#60519b' }} />
          <h3 className="section-title">Logros</h3>
          <span className="section-count">
            {achievements.filter(a => a.unlocked).length} / {achievements.length}
          </span>
        </div>

        {achievements.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>No hay logros disponibles</p>
        ) : (
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {achievement.icon}
                  {!achievement.unlocked && (
                    <div className="lock-overlay">
                      <Lock size={16} />
                    </div>
                  )}
                </div>
                
                <div className="achievement-info">
                  <div className="achievement-category">{achievement.category}</div>
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-description">{achievement.description}</div>
                </div>

                {!achievement.unlocked && achievement.progress < 100 && (
                  <div className="achievement-progress">
                    <div 
                      className="achievement-progress-bar" 
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de Títulos */}
      <div className="titles-container">
        <div className="section-header">
          <Award size={24} style={{ color: '#60519b' }} />
          <h3 className="section-title">Títulos</h3>
          <span className="section-count">
            {titles.filter(t => t.unlocked).length} / {titles.length}
          </span>
        </div>

        {titles.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>No hay títulos disponibles</p>
        ) : (
          <div className="titles-grid">
            {titles.map(title => (
              <div 
                key={title.id} 
                className={`title-card ${title.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="title-icon-wrapper">
                  {title.unlocked ? <Star size={24} /> : <Lock size={24} />}
                </div>
                
                <div className="title-info">
                  <div className="title-name">{title.name}</div>
                  <div className="title-description">{title.description}</div>
                  <div className="title-badge">
                    {title.unlocked ? 'Desbloqueado' : 'Bloqueado'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
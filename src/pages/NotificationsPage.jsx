// src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, Filter, Calendar, Trophy, CheckCircle2, 
  Clock, Target, Smartphone, Download, X, 
  TrendingUp, Zap, Award, Share2
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import '../styles/NotificationsPage.css';

export default function NotificationsPage({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, new, finished
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Cargar partidos nuevos (creados en los últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convertir a formato de notificaciones
      const notifs = matches.map(match => {
        const isNew = match.status === 'pending';
        const isFinished = match.status === 'finished';
        
        return {
          id: match.id,
          type: isNew ? 'new' : 'finished',
          title: isNew ? '¡Nuevo partido disponible!' : '¡Partido finalizado!',
          description: `${match.home_team} vs ${match.away_team}`,
          league: match.league,
          date: match.date,
          time: match.time,
          result: isFinished ? `${match.result_home || 0} - ${match.result_away || 0}` : null,
          created_at: match.created_at,
          icon: isNew ? <Trophy size={20} /> : <CheckCircle2 size={20} />
        };
      });

      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  const handleInstallPWA = () => {
    alert('Para instalar la app:\n\n1. En tu navegador, toca el menú (⋮)\n2. Selecciona "Añadir a pantalla de inicio"\n3. ¡Listo! Tendrás acceso directo');
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-title-section">
          <Bell size={32} className="bell-icon" />
          <div>
            <h1 className="page-title">Notificaciones</h1>
            <p className="page-subtitle">Mantente al día con todos los partidos</p>
          </div>
        </div>
      </div>

      <div className="notifications-container">
        {/* Banner de Instalación - Fijado */}
        {showInstallBanner && (
          <div className="install-banner pinned">
            <button 
              className="banner-close"
              onClick={() => setShowInstallBanner(false)}
            >
              <X size={18} />
            </button>
            
            <div className="banner-content">
              <div className="banner-icon">
                <Smartphone size={32} />
              </div>
              
              <div className="banner-info">
                <h3 className="banner-title">
                  <Download size={18} />
                  ¡Instala GlobalScore!
                </h3>
                <p className="banner-description">
                  Agrega nuestra app a tu pantalla de inicio para acceso rápido y sin complicaciones
                </p>
              </div>
            </div>

            <div className="banner-actions">
              <button className="install-btn" onClick={handleInstallPWA}>
                <Download size={18} />
                <span>Instalar Ahora</span>
              </button>
              <button className="share-btn">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="notifications-filters">
          <button 
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <Filter size={16} />
            <span>Todas</span>
            <span className="chip-count">{notifications.length}</span>
          </button>

          <button 
            className={`filter-chip ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            <Trophy size={16} />
            <span>Nuevos Partidos</span>
            <span className="chip-count">
              {notifications.filter(n => n.type === 'new').length}
            </span>
          </button>

          <button 
            className={`filter-chip ${filter === 'finished' ? 'active' : ''}`}
            onClick={() => setFilter('finished')}
          >
            <CheckCircle2 size={16} />
            <span>Finalizados</span>
            <span className="chip-count">
              {notifications.filter(n => n.type === 'finished').length}
            </span>
          </button>
        </div>

        {/* Lista de Notificaciones */}
        <div className="notifications-list">
          {loading ? (
            <div className="notifications-loading">
              <div className="spinner-ring"></div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell size={64} />
              <h3>No hay notificaciones</h3>
              <p>Cuando haya novedades, aparecerán aquí</p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notification-card ${notif.type}`}
              >
                <div className={`notif-icon-wrapper ${notif.type}`}>
                  {notif.icon}
                </div>

                <div className="notif-content">
                  <div className="notif-header">
                    <h4 className="notif-title">{notif.title}</h4>
                    <span className="notif-time">{getTimeAgo(notif.created_at)}</span>
                  </div>

                  <p className="notif-description">{notif.description}</p>

                  <div className="notif-details">
                    <div className="detail-item">
                      <Award size={14} />
                      <span>{notif.league}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>{notif.date}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>{notif.time}</span>
                    </div>
                  </div>

                  {notif.result && (
                    <div className="notif-result">
                      <Target size={16} />
                      <span className="result-score">{notif.result}</span>
                    </div>
                  )}
                </div>

                <div className={`notif-badge ${notif.type}`}>
                  {notif.type === 'new' ? 'Nuevo' : 'Finalizado'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
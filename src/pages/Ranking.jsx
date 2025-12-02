import React from "react";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { PageLoader } from "../components/LoadingStates";
import RankingSidebar from "../components/RankingSidebar"; // Asume que este componente es reutilizable

export default function RankingPage() {
  const { profile: currentUser } = useAuth();
  // Obtenemos los usuarios y el estado de carga del hook
  const { users, loading, refreshData } = useDashboardData();

  if (loading) {
    return (
      <div className="ranking-page">
        <PageLoader /> 
        <p>Cargando posiciones del ranking...</p>
      </div>
    );
  }

  // 1. Obtener la lista de usuarios ordenada (ascendente)
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  // 2. Determinar la posición del usuario actual
  let currentUserRank = -1;
  if (currentUser) {
    currentUserRank = sortedUsers.findIndex(u => u.auth_id === currentUser.auth_id) + 1;
  }
  
  // 3. Adaptar el RankingSidebar (o crear un RankingTable dedicado) para mostrar el contenido completo
  // Si tu RankingSidebar solo muestra los primeros 10, puedes crear un RankingTable que muestre a todos.
  // Por ahora, reutilizaremos el RankingSidebar, asumiendo que muestra la lista completa.

  return (
    <div className="ranking-page main-grid-full-width">
      <h1>🏆 Ranking de Predictores</h1>
      
      {/* Información del usuario en el ranking */}
      {currentUser && (
        <div className="user-ranking-info">
          <p>Tu posición actual: <strong>#{currentUserRank}</strong></p>
          <p>Puntos: <strong>{currentUser.points}</strong></p>
        </div>
      )}
      
      {/* Usamos el RankingSidebar, dándole la lista completa de usuarios */}
      <div className="ranking-full-list">
        {/* Aquí podrías crear un componente <RankingTable users={sortedUsers} /> 
            para una vista más completa que el sidebar. 
            Por ahora, usamos el componente existente para no detener el flujo. */}
        <RankingSidebar 
          users={sortedUsers} 
          currentUserId={currentUser?.auth_id} 
          // Es posible que el RankingSidebar necesite una prop para mostrar la lista completa
          showFullList={true} 
        />
        {/* Botón de recarga si fuera necesario */}
        <button onClick={refreshData} style={{ marginTop: '20px' }}>Actualizar Ranking</button>
      </div>

    </div>
  );
}
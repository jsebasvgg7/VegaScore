import { Outlet } from "react-router-dom";
import Header from "./Header"; // Tu Header existente
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./LoadingStates"; // Tu loader existente

export default function MainLayout() {
  const { profile, loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <div className="vega-root">
      {/* El Header recibe el perfil directamente del Contexto */}
      <Header currentUser={profile} /> 
      
      <main className="container">
        {/* Outlet renderiza la página que corresponda (Ranking, Home, etc.) */}
        <Outlet /> 
      </main>
    </div>
  );
}
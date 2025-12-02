// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VegaScorePage from "./pages/VegaScorePage";
import RankingPage from "./pages/RankingPage";
import AdminPage from "./pages/AdminPage";

// Wrapper para pasar navigate a los componentes
function AppRoutes() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error al obtener sesión:", error);
          setLoading(false);
          return;
        }

        setSession(session);
        
        // Si hay sesión, cargar datos del usuario
        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", session.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("Error al cargar usuario:", userError);
          } else if (userData) {
            setCurrentUser(userData);
          }
        }
      } catch (err) {
        console.error("Error en initSession:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", session.user.id)
            .maybeSingle();
          
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // Limpiar el listener al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <p style={{ color: "#fff" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Si está logueado → redirigir a /app */}
      <Route
        path="/"
        element={session ? <Navigate to="/app" replace /> : <LoginPage />}
      />

      {/* Si está logueado → no mostrar registro */}
      <Route
        path="/register"
        element={session ? <Navigate to="/app" replace /> : <RegisterPage />}
      />

      {/* Página principal protegida */}
      <Route
        path="/app"
        element={
          session ? (
            <VegaScorePage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Página de Ranking */}
      <Route
        path="/ranking"
        element={
          session ? (
            <RankingPage 
              currentUser={currentUser} 
              onBack={() => navigate('/app')} 
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Página de Admin - Solo para administradores */}
      <Route
        path="/admin"
        element={
          session ? (
            currentUser?.is_admin ? (
              <AdminPage 
                currentUser={currentUser} 
                onBack={() => navigate('/app')} 
              />
            ) : (
              <Navigate to="/app" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Ruta catch-all para URLs no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
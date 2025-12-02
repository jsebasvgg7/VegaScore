import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VegaScorePage from "./pages/VegaScorePage";
import RankingPage from "./pages/RankingPage";


export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    // Limpiar el listener al desmontar
    return () => {
      listener.subscription.unsubscribe();
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
    <BrowserRouter>
      <Routes>
        {/* Si está logueado → redirigir a /app */}
        <Route
          path="/"
          element={session ? <Navigate to="/app" /> : <LoginPage />}
        />

        {/* Si está logueado → no mostrar registro */}
        <Route
          path="/register"
          element={session ? <Navigate to="/app" /> : <RegisterPage />}
        />

        {/* Página principal protegida */}
        <Route
          path="/app"
          element={session ? <VegaScorePage /> : <Navigate to="/" />}
        />

        {/* Página de Ranking */}
        <Route
          path="/ranking"
          element={session ? <RankingPage /> : <Navigate to="/" />}
        />





      </Routes>
    </BrowserRouter>
  );}
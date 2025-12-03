import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VegaScorePage from "./pages/VegaScorePage";
import RankingPage from "./pages/RankingPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      if (data?.session) {
        loadUserData(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          loadUserData(session.user.id);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (authId) => {
    try {
      // Cargar usuario actual
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        // Crear perfil si no existe
        const { data: authUser } = await supabase.auth.getUser();
        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            auth_id: authId,
            name: authUser.user.email?.split('@')[0] || "Usuario",
            email: authUser.user.email,
            points: 0,
            predictions: 0,
            correct: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        setCurrentUser(newProfile);
      } else {
        setCurrentUser(profile);
      }

      // Cargar todos los usuarios
      const { data: userList } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      setUsers(userList || []);
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Header aparece en todas las rutas protegidas */}
      {session && currentUser && (
        <Header
          currentUser={currentUser}
          users={users}
          onProfileClick={() => setShowProfile(!showProfile)}
        />
      )}

      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/"
          element={session ? <Navigate to="/app" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={session ? <Navigate to="/app" /> : <RegisterPage />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/app"
          element={session ? <VegaScorePage /> : <Navigate to="/" />}
        />
        <Route
          path="/ranking"
          element={session ? <RankingPage currentUser={currentUser} users={users} /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={session ? <AdminPage currentUser={currentUser} users={users} /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={session ? <ProfilePage currentUser={currentUser} onBack={() => window.history.back()} /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
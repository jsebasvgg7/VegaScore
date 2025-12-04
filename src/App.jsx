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
import NotificationsPage from "./pages/NotificationsPage";
import StatsPage from "./pages/StatsPage";
import { PageLoader } from "./components/LoadingStates";

export default function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Agregar clase al body durante carga
    if (loading && initialLoad) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }

    return () => {
      document.body.classList.remove('loading');
    };
  }, [loading, initialLoad]);

  useEffect(() => {
    let mounted = true;

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      setSession(data?.session || null);
      
      if (data?.session) {
        loadUserData(data.session.user.id);
      } else {
        setLoading(false);
        setInitialLoad(false);
      }
    });

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setSession(session);
        if (session) {
          loadUserData(session.user.id);
        } else {
          setLoading(false);
          setCurrentUser(null);
        }
      }
    );

    return () => {
      mounted = false;
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
      // Pequeño delay para evitar flash en móviles
      setTimeout(() => {
        setLoading(false);
        setInitialLoad(false);
      }, 300);
    }
  };

  // Solo mostrar PageLoader en la carga inicial
  if (loading && initialLoad) {
    return <PageLoader />;
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
          element={session ? <Navigate to="/app" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={session ? <Navigate to="/app" replace /> : <RegisterPage />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/app"
          element={session ? <VegaScorePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/notifications"
          element={session ? <NotificationsPage currentUser={currentUser} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/ranking"
          element={session ? <RankingPage currentUser={currentUser} users={users} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/admin"
          element={session ? <AdminPage currentUser={currentUser} users={users} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile"
          element={session ? <ProfilePage currentUser={currentUser} onBack={() => window.history.back()} /> : <Navigate to="/" replace />}
        />
        <Route 
          path="/stats"
          element={session ? <StatsPage currentUser={currentUser} /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
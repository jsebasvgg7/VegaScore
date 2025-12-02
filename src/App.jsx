// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Importaciones de Rutas Públicas
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Importaciones de las Vistas Principales (Las nuevas páginas)
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard"; // La antigua VegaScorePage limpia
import RankingPage from "./pages/Ranking";  // Nueva página de Ranking (Paso 6A)
import AdminPanel from "./pages/AdminPanel";
import ProfilePage from "./pages/ProfilePage"; // Nueva página de Administración (Paso 6B)

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // O un spinner
  if (!user) return <Navigate to="/" />;
  return children;
};

// Pequeño helper para no dejar entrar a login si ya estás logueado
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/app" />;
  return children;
};


export default function App() {
  return (
    <AuthProvider> {/* 1. Todo envuelto en el proveedor */}
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* ---------------------------------------------------- */}
          {/* Rutas Privadas (Nesting dentro de MainLayout) */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            
            {/* 1. DASHBOARD (HOME) */}
            <Route path="/app" element={<Dashboard />} />
            
            {/* 2. RANKING DEDICADO */}
            <Route path="/ranking" element={<RankingPage />} />
            
            {/* 3. PANEL DE ADMINISTRACIÓN DEDICADO */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* 4. PÁGINA DE PERFIL */}
            <Route path="/profile" element={<ProfilePage />} />
            
          </Route>
          {/* ---------------------------------------------------- */}

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
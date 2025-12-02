import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Datos de auth (email, id)
  const [profile, setProfile] = useState(null); // Datos de tu tabla 'users' (puntos, admin)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión actual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    getSession();

    // 2. Escuchar cambios (Login/Logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Función auxiliar para traer el perfil extendido
  const fetchProfile = async (userId, userEmail) => {
    try {
      // 1. Intentar cargar el perfil
      let { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      // 2. Si el perfil NO existe, crearlo automáticamente
      if (!profile) {
        console.log("Perfil no encontrado, creando uno nuevo...");
        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            auth_id: userId,
            name: userEmail?.split('@')[0] || "Usuario",
            email: userEmail,
            points: 0,
            predictions: 0,
            correct: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
        console.log("Perfil creado exitosamente.");
      }
      
      setProfile(profile);
      
    } catch (error) {
      console.error("Error al gestionar el perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: profile?.is_admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
// src/context/AuthContext.jsx (Versión Final Robusta)

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función auxiliar para traer el perfil extendido
  const fetchProfile = async (userId, userEmail) => {
    // Usamos una promesa aquí para garantizar que la función se complete
    return new Promise(async (resolve) => { 
      try {
        console.log("Intentando cargar o crear perfil para:", userId);

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
              // IMPORTANTE: Asegúrate de incluir aquí is_admin: false si es requerido.
            })
            .select()
            .single();

          if (createError) throw createError;
          profile = newProfile;
          console.log("Perfil creado exitosamente.");
        }
        
        setProfile(profile);
        resolve(true); // Resuelve la promesa exitosamente
        
      } catch (error) {
        // Si hay un error de Supabase, al menos se registrará aquí.
        console.error("ERROR CRÍTICO AL GESTIONAR EL PERFIL:", error.message);
        setProfile(null);
        resolve(false); // Resuelve la promesa con error
      } 
      // NOTA: 'finally' se ha movido al useEffect para garantizar el setLoading(false)
      // incluso si la llamada a fetchProfile se resuelve como 'false'.
    });
  };


  useEffect(() => {
    // Función central para manejar la sesión y el perfil
    const handleSession = async (session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      
      if (authUser) {
        // Esperamos a que la promesa se resuelva
        await fetchProfile(authUser.id, authUser.email); 
      }
      // Llamar a setLoading(false) siempre al final del flujo.
      setLoading(false); 
    };

    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    // 2. Escuchar cambios (Login/Logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Al haber un evento de cambio, ponemos loading en true temporalmente
      // para evitar flashes mientras se recarga el perfil.
      setLoading(true); 
      handleSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []); 
  
  // Helper para el valor de isAdmin
  const isAdmin = profile?.is_admin === true;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
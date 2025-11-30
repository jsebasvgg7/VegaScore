import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/Auth.css";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Crear cuenta en auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error("No se pudo crear el usuario");
      }

      console.log("Usuario auth creado:", data.user.id);

      // 2️⃣ Crear perfil en users
      const { error: insertError } = await supabase.from("users").insert({
        auth_id: data.user.id,
        name: name.trim(),
        points: 0,
        predictions: 0,
        correct: 0
      });

      if (insertError) {
        console.error("Error al insertar en users:", insertError);
        throw insertError;
      }

      console.log("Perfil creado exitosamente");

      // 3️⃣ Verificar que se creó correctamente
      const { data: verifyUser, error: verifyError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .single();

      if (verifyError) {
        console.error("Error al verificar usuario:", verifyError);
      } else {
        console.log("Usuario verificado:", verifyUser);
      }

      alert("¡Cuenta creada exitosamente! Iniciando sesión...");
      
      // Redirigir automáticamente a la app
      navigate("/app");

    } catch (error) {
      console.error("Error en registro:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={register}>
        <h2>Crear Cuenta</h2>

        <input
          type="text"
          placeholder="Nombre de usuario"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={3}
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button className="btn" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <p className="auth-alt">
          ¿Ya tienes cuenta? <Link to="/">Iniciar sesión</Link>
        </p>
        <p className="auth-alt2" >
          Al registrarte revisa tu correo electrónico para activar tu cuenta.
          </p>
      </form>
    </div>
  );
}
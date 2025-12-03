import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/Auth.css";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("No se pudo crear el usuario");

      const { error: insertError } = await supabase.from("users").insert({
        auth_id: data.user.id,
        name: name.trim(),
        points: 0,
        predictions: 0,
        correct: 0
      });

      if (insertError) throw insertError;

      setMessage("Revisa tu correo para activar tu cuenta");

    } catch (error) {
      console.error("Error en registro:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* TITULO MEJORADO */}
        <h2>Crea tu Estrategia</h2>

        <input
          type="text"
          placeholder="Tu Nombre de Usuario" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={3}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button className="btn" onClick={register} disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear mi Cuenta"}
        </button>

        {message && <p className="success-message">{message}</p>}

        <div className="auth-alt">
          <span></span>
          <Link to="/">Ya tengo cuenta</Link>
        </div>
      </div>
    </div>
  );
}
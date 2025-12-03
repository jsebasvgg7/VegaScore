import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/Auth.css";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* TITULO MEJORADO */}
        <h2>El Marcador te Espera</h2> 

        <input
          type="email"
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn" onClick={login} disabled={loading}>
          {loading ? "Cargando..." : "Entrar a la Cancha"} 
        </button>

        <div className="auth-alt">
          <Link to="/forgot-password">Olvidé mi Contraseña</Link> 
          <Link to="/register">Crear mi Cuenta</Link>
        </div>
      </div>
    </div>
  );
}
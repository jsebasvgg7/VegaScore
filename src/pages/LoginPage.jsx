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
        {/* TITULO MOTIVACIONAL */}
        <h2>Login</h2> 
        <p className="auth-subtitle">Welcome back! Ready to make your predictions?
        </p>

        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn" onClick={login} disabled={loading}>
          {loading ? "Loading..." : "Enter"} {/* Botón temático */}
        </button>

        <div className="auth-alt">
          <Link to="/forgot-password">Forgot Your Strategy?</Link>
          <Link to="/register">Sign Up</Link> {/* Enlace motivacional */}
        </div>
      </div>
    </div>
  );
}
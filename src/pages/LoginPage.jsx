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
        <h2>Ready to Predict?</h2> 

        <input
          type="email"
          placeholder="Your Email (The key to the stadium)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (Your winning strategy)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn" onClick={login} disabled={loading}>
          {loading ? "Loading..." : "Enter the Pitch"} {/* Botón temático */}
        </button>

        <div className="auth-alt">
          <Link to="/forgot-password">Forgot Your Strategy?</Link>
          <Link to="/register">Join the League</Link> {/* Enlace motivacional */}
        </div>
      </div>
    </div>
  );
}
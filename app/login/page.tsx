"use client";

import Image from "next/image";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/shop_now";
    }
    setLoading(false);
  }

  return (
    <main className="login-page">
      <div className="overlay">
        <div className="content">

          <Image src="/logo.png" alt="Logo" width={180} height={180} className="logo" />

          <div className="form-box">
            <input
              type="email"
              placeholder="EMAIL"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="PASSWORD"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="error-msg">{error}</p>}

            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>

            <p className="signup-link">
              Don&apos;t have an account? <a href="/signup">Sign up</a>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

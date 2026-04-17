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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      const userEmail = data.user?.email ?? "";
      if (userEmail === "admin@maelittleloops.com") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/shop_now";
      }
    }
    setLoading(false);
  }

  return (
    <main className="login-page">

      {/* LEFT PANEL */}
      <div className="login-left">
        <Image src="/logo.png" alt="Mae Little Loops Studio" width={320} height={320} className="login-logo" />
        <h1>Mae Little Loops Studio</h1>
        <p>Handmade with love 🌸</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="login-sub">Log in to your account</p>

          <div className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') handleLogin(); }}
              />
            </div>

            {error && <p className="error-msg">⚠️ {error}</p>}

            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Log In"}
            </button>

            <div className="divider"><span>or</span></div>

            <p className="signup-link">
              Don&apos;t have an account? <a href="/signup">Create one</a>
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}

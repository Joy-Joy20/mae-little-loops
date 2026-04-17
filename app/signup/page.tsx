"use client";

import Image from "next/image";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError("");
    setSuccess("");
    if (password !== repeat) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else if (data.user) {
      setSuccess("Account created! You can now log in.");
      setTimeout(() => window.location.href = "/login", 2000);
    } else {
      setError("Something went wrong. Please try again.");
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
          <h2>Create Account</h2>
          <p className="login-sub">Sign up to get started</p>

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
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              />
            </div>

            {error && <p className="error-msg">⚠️ {error}</p>}
            {success && <p className="success-msg">✅ {success}</p>}

            <button className="login-btn" onClick={handleSignup} disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <div className="divider"><span>or</span></div>

            <p className="signup-link">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}

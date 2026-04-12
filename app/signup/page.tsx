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
            <input
              type="password"
              placeholder="REPEAT PASSWORD"
              className="input-field"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            />

            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}

            <button className="login-btn" onClick={handleSignup} disabled={loading}>
              {loading ? "SIGNING UP..." : "SIGNUP"}
            </button>

            <p className="signup-link">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

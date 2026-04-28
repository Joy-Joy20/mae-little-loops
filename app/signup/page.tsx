"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== repeat) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (signUpError) {
      setError(signUpError.message || "An error occurred. Please try again.");
    } else {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Welcome to Mae Little Loops Studio! 🌸",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
              <h2 style="color:#c44dff;">Welcome to Mae Little Loops Studio! 🌸</h2>
              <p>Thank you for signing up, <strong>${email}</strong>!</p>
              <p>Explore our handmade crochet bouquets and keychains — crafted with love.</p>
              <a href="${window.location.origin}/shop_now" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#ff6b9d,#c44dff);color:white;text-decoration:none;border-radius:50px;font-weight:bold;margin-top:16px;">Start Shopping</a>
              <p style="color:#aaa;font-size:12px;margin-top:24px;">If you did not sign up, ignore this email.</p>
            </div>
          `,
        }),
      });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
    setLoading(false);
  }

  return (
    <main className="login-page">

      {/* LEFT PANEL */}
      <div className="login-left">
        <Image src="/logo.png" alt="Mae Little Loops Studio" width={420} height={420} className="login-logo" />
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
                type="text"
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

            {error ? <p className="error-msg">⚠️ {error}</p> : null}

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

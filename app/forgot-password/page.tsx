"use client";

import Image from "next/image";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleReset() {
    setErrorMsg("");
    if (!email.trim()) {
      setErrorMsg("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result.error) {
        setErrorMsg(
          typeof result.error.message === "string"
            ? result.error.message
            : "Something went wrong. Please try again."
        );
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMsg("Failed to send reset link. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main className="login-page">

      <div className="login-left">
        <Image src="/logo.png" alt="Mae Little Loops Studio" width={420} height={420} className="login-logo" />
        <h1>Mae Little Loops Studio</h1>
        <p>Handmade with love 🌸</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          {success ? (
            <>
              <h2>Check Your Email</h2>
              <p className="login-sub">We sent a password reset link to <strong>{email}</strong>.</p>
              <p style={{color:'#e91e8c', textAlign:'center', marginTop:'16px', fontSize:'14px'}}>
                ✅ Reset link sent! Please check your email inbox.
              </p>
              <div style={{marginTop:'24px'}}>
                <a href="/login" className="login-btn" style={{display:'block', textAlign:'center', textDecoration:'none'}}>
                  Back to Login
                </a>
              </div>
            </>
          ) : (
            <>
              <h2>Forgot Password?</h2>
              <p className="login-sub">Enter your email and we&apos;ll send you a reset link.</p>
              <div className="login-form">
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="text"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleReset(); }}
                  />
                </div>
                {errorMsg !== "" ? <p className="error-msg">⚠️ {errorMsg}</p> : null}
                <button className="login-btn" onClick={handleReset} disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <div className="divider"><span>or</span></div>
                <p className="signup-link"><a href="/login">← Back to Login</a></p>
              </div>
            </>
          )}
        </div>
      </div>

    </main>
  );
}

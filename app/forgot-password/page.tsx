"use client";

import Image from "next/image";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleReset() {
    setErrorMsg("");
    if (!email.trim()) { setErrorMsg("Please enter your email."); return; }
    setLoading(true);
    try {
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

      const { error: insertError } = await supabase
        .from("password_resets")
        .insert([{
          email: email.trim(),
          token,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        }]);

      if (insertError) { setErrorMsg("Failed to process request. Please try again."); return; }

      const resetLink = `${window.location.origin}/reset-password?token=${token}&email=${encodeURIComponent(email.trim())}`;

      const emailRes = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.trim(),
          subject: "🔐 Reset Your Password — Mae Little Loops Studio",
          html: `
            <div style="font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto;">
              <h2 style="color:#e91e8c;">Reset Your Password 🔐</h2>
              <p>Hi <strong>${email}</strong>,</p>
              <p>Click the button below to reset your password. This link expires in 30 minutes.</p>
              <div style="text-align:center;margin:30px 0;">
                <a href="${resetLink}" style="background:linear-gradient(135deg,#e91e8c,#f06292);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;">Reset Password</a>
              </div>
              <p style="color:#aaa;font-size:13px;">If you did not request this, ignore this email.</p>
              <p style="color:#e91e8c;font-weight:bold;">Mae Little Loops Studio 🌸</p>
            </div>
          `,
        }),
      });

      if (!emailRes.ok) { setErrorMsg("Failed to send reset email. Please try again."); return; }

      setSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">

      <div className="login-left">
        <Image src="/logo.png" alt="Mae Little Loops Studio" width={420} height={420} className="login-logo" priority />
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
                {errorMsg ? <p className="error-msg">⚠️ {String(errorMsg)}</p> : null}
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

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase sets the session from the URL hash after clicking the reset link
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setError("Invalid or expired reset link. Please request a new one.");
    });
  }, []);

  async function handleUpdate() {
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || "Failed to update password. Please try again.");
    } else {
      await supabase.auth.signOut();
      router.push("/login?reset=success");
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
          <h2>Reset Password</h2>
          <p className="login-sub">Enter your new password below.</p>
          <div className="login-form">
            {!ready && error ? (
              <>
                <p className="error-msg">⚠️ {error}</p>
                <a href="/forgot-password" className="login-btn" style={{display:'block', textAlign:'center', textDecoration:'none', marginTop:'8px'}}>Request New Link</a>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(); }} />
                </div>
                {error ? <p className="error-msg">⚠️ {error}</p> : null}
                <button className="login-btn" onClick={handleUpdate} disabled={loading || !ready}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    </main>
  );
}

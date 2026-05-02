"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleUpdatePassword() {
    setErrorMsg("");
    if (!password || !confirmPassword) { setErrorMsg("Please fill in all fields."); return; }
    if (password !== confirmPassword) { setErrorMsg("Passwords do not match."); return; }
    if (password.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }
    if (!token || !email) { setErrorMsg("Invalid or expired reset link."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.error || "Failed to update password.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
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
              <h2>Password Reset Successful! ✅</h2>
              <p className="login-sub">Your password has been updated. Redirecting to login...</p>
            </>
          ) : (
            <>
              <h2>Reset Password</h2>
              <p className="login-sub">Enter your new password below.</p>
              <div className="login-form">
                <div className="input-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleUpdatePassword(); }} />
                </div>
                {errorMsg && <p className="error-msg">⚠️ {errorMsg}</p>}
                <button className="login-btn" onClick={handleUpdatePassword} disabled={loading}>
                  {loading ? "Updating..." : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

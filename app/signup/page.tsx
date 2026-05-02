"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP screen
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!showOtp) return;
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [showOtp, resendTimer]);

  async function sendOtp(targetEmail: string) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await supabase.from("otp_codes").insert([{ email: targetEmail, code: otpCode }]);

    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: targetEmail,
        subject: "Your Verification Code — Mae Little Loops Studio",
        html: `
          <div style="font-family:Arial,sans-serif;text-align:center;padding:40px;">
            <h2 style="color:#e91e8c;">Mae Little Loops Studio 🌸</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size:48px;letter-spacing:12px;color:#e91e8c;background:#fce4ec;padding:20px;border-radius:12px;">
              ${otpCode}
            </h1>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <p>Do not share this code with anyone.</p>
            <p style="color:#aaa;font-size:12px;">If you did not sign up, ignore this email.</p>
          </div>
        `,
      }),
    });
  }

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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      if (signUpError.message === "User already registered") {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError(signUpError.message || "An error occurred. Please try again.");
      }
      setLoading(false);
      return;
    }

    // Insert profile row so admin dashboard can see this user
    if (signUpData.user) {
      await supabase.from("profiles").insert([{
        id: signUpData.user.id,
        email,
        role: "customer",
      }]).select().single();
    }

    await sendOtp(email);
    setLoading(false);
    setShowOtp(true);
    setResendTimer(60);
  }

  async function handleVerify() {
    setOtpError("");
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit code.");
      return;
    }
    setOtpLoading(true);
    const { data } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("code", otp)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (!data) {
      setOtpError("Invalid or expired code. Please try again.");
    } else {
      await supabase.from("otp_codes").update({ used: true }).eq("id", data.id);
      router.push("/login");
    }
    setOtpLoading(false);
  }

  async function handleResend() {
    setResending(true);
    await sendOtp(email);
    setResendTimer(60);
    setResending(false);
    setOtpError("");
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

          {!showOtp ? (
            <>
              <h2>Create Account</h2>
              <p className="login-sub">Sign up to get started</p>
              <div className="login-form">
                <div className="input-group">
                  <label>Email</label>
                  <input type="text" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Repeat your password" value={repeat} onChange={(e) => setRepeat(e.target.value)} />
                </div>
                {error ? (
                  <div>
                    <p className="error-msg">⚠️ {error}</p>
                    {error.includes("already registered") && (
                      <p className="signup-link" style={{marginTop:'8px'}}>
                        Already have an account? <a href="/login">Log in</a>
                      </p>
                    )}
                  </div>
                ) : null}
                <button className="login-btn" onClick={handleSignup} disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
                <div className="divider"><span>or</span></div>
                <p className="signup-link">Already have an account? <a href="/login">Log in</a></p>
              </div>
            </>
          ) : (
            <>
              <h2>Verify Your Email</h2>
              <p className="login-sub">We sent a 6-digit code to <strong>{email}</strong></p>
              <div className="login-form">
                <div className="input-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    style={{ textAlign: "center", letterSpacing: "8px", fontSize: "22px", fontWeight: "700" }}
                  />
                </div>
                {otpError ? <p className="error-msg">⚠️ {otpError}</p> : null}
                <button className="login-btn" onClick={handleVerify} disabled={otpLoading}>
                  {otpLoading ? "Verifying..." : "Verify Account"}
                </button>
                <button
                  className="resend-btn"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || resending}
                >
                  {resending ? "Sending..." : resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Code"}
                </button>
                <p className="signup-link"><a href="/signup">← Back to Sign Up</a></p>
              </div>
            </>
          )}

        </div>
      </div>

    </main>
  );
}

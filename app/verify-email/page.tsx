"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";

  return (
    <main className="verify-page">
      <div className="verify-card">
        <Image src="/logo.png" alt="Mae Little Loops Studio" width={90} height={90} style={{ borderRadius: "16px", marginBottom: "8px" }} />
        <div className="verify-icon">📧</div>
        <h1>Check Your Email</h1>
        <p className="verify-sub">We sent a verification link to</p>
        <p className="verify-email">{email}</p>
        <p className="verify-desc">
          Click the link in your email to verify your account before logging in.
          Check your spam folder if you don&apos;t see it.
        </p>
        <div className="verify-divider" />
        <p className="verify-note">Already verified?</p>
        <a href="/login" className="verify-btn">Go to Login</a>
        <a href="/signup" className="verify-back">← Back to Sign Up</a>
      </div>
    </main>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

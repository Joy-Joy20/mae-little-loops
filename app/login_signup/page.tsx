"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="main">
      <div className="content">

        <Image
          src="/logo.png"
          alt="Mae Little Loops Studio"
          width={400}
          height={250}
          className="logo"
          priority
        />

        <button className="btn" onClick={() => router.push("/shop_now")}>
          SHOP NOW
        </button>

        <button className="btn" onClick={() => router.push("/login")}>
          LOGIN
        </button>

        <button className="btn" onClick={() => router.push("/signup")}>
          SIGNUP
        </button>

      </div>
    </main>
  );
}
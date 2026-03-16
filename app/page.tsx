import Image from "next/image";

export default function Home() {
  return (
    <div className="container">

      <div className="card">

        <Image
          src="/logo.png"
          alt="Mae Little Loops Studio"
          width={600}
          height={350}
          priority
        />

        <br />

        <button className="start-btn">
          GET STARTED
        </button>

      </div>

    </div>
  );
}
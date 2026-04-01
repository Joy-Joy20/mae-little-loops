import Image from "next/image";

export default function Signup() {
  return (
    <main className="login-page">
      <div className="overlay">
        <div className="content">

          <Image
            src="/logo.png"
            alt="Logo"
            width={180}
            height={180}
            className="logo"
          />

          <div className="form-box">
            <input type="text" placeholder="USERNAME" className="input-field" />
            <input type="email" placeholder="EMAIL" className="input-field" />
            <input type="password" placeholder="PASSWORD" className="input-field" />
            <input type="password" placeholder="REPEAT PASSWORD" className="input-field" />
            <button className="login-btn">SIGNUP</button>
          </div>

        </div>
      </div>
    </main>
  );
}

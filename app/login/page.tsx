import Image from "next/image";

export default function LoginSignup() {
  return (
    <main className="login-page">

      <div className="overlay">

        <div className="content">

          {/* LOGO */}
          <Image
            src="/logo.png"
            alt="Logo"
            width={180}
            height={180}
            className="logo"
          />

          {/* FORM */}
          <div className="form-box">

            <input
              type="text"
              placeholder="USERNAME"
              className="input-field"
            />

            <input
              type="password"
              placeholder="PASSWORD"
              className="input-field"
            />

            <button className="login-btn">
              LOGIN
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}
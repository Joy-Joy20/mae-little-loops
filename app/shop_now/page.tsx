import Image from "next/image";

export default function Home() {
  return (
    <main>

      {/* PRODUCTS */}
      <section className="products">

        <div className="card">
          <Image src="/p1.png" alt="Charm" width={120} height={120} />
          <h3>Charm</h3>
          <p className="price">₱200.00</p>
          <button className="btn">SHOP NOW</button>
        </div>

        <div className="card">
          <Image src="/p2.png" alt="Pastel Bloom Bouquet" width={120} height={120} />
          <h3>Pastel Bloom Bouquet</h3>
          <p className="price">₱250.00</p>
          <button className="btn">SHOP NOW</button>
        </div>

        <div className="card">
          <Image src="/p3.png" alt="Lavender Bell Flowers" width={120} height={120} />
          <h3>Lavender Bell Flowers</h3>
          <p className="price">₱300.00</p>
          <button className="btn">SHOP NOW</button>
        </div>

        <div className="card">
          <Image src="/p4.png" alt="Mini White Pastel Flower Bouquet" width={120} height={120} />
          <h3>Mini White Pastel Flower Bouquet</h3>
          <p className="price">₱150.00</p>
          <button className="btn">SHOP NOW</button>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-left">
          <Image src="/logo.png" alt="Logo" width={120} height={120} />
          <h2>Mae Little Loops Studio</h2>
        </div>

        <div className="footer-middle">
          <h4>🌸 Special Bouquets</h4>
          <ul>
            <li>Cute keychains</li>
            <li>Special Gift Gifts</li>
          </ul>
        </div>

        <div className="footer-right">
          <p>📧 Email: maelittleloops@gmail.com</p>
          <p>📱 Call / Text: 09XXXXXXXXX</p>
        </div>

      </footer>

    </main>
  );
}
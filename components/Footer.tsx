"use client";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="footer-col">
        <h3>Mae Little Loops Studio</h3>
        <p>Handmade with love, crafted with care.</p>
        <div className="footer-social">
          <a href="https://www.facebook.com/mae.09706383306" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
          </a>
          <a href="mailto:masarquemae65@gmail.com" aria-label="Email">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>
      </div>
      <div className="footer-col">
        <h3>Categories</h3>
        <a href="/bouquets">Bouquets</a>
        <a href="/keychain">Keychains</a>
      </div>
      <div className="footer-col">
        <h3>Contact</h3>
        <p>masarquemae65@gmail.com</p>
        <p>09706383306</p>
        <p>Masbate, Philippines</p>
      </div>
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.2)',
        marginTop: '2rem',
        paddingTop: '1rem',
        textAlign: 'center',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.8)',
        width: '100%',
      }}>
        &copy; {year} Mae Little Loops Studio. All Rights Reserved.
      </div>
    </footer>
  );
}

import "./global.css";
import { CartProvider } from "../context/CartContext";

export const metadata = {
  title: "Mae Little Loops Studio",
  description: "Mae Little Loops Studio",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

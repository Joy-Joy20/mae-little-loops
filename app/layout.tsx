import "./globals.css";

export const metadata = {
  title: "Mae Little Loops Studio",
  description: "Crochet Studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
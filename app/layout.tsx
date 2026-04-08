import "./global.css";

export const metadata = {
  title: "Mae Little Loops Studio",
  description: "Mae Little Loops Studio",
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

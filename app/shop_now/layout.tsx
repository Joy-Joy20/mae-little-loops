import "./global.css";

export const metadata = {
  title: "Mae Little Loops Studio",
  description: "Shop Page",
};

export default function ShopNowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
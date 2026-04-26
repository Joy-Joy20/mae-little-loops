import "./global.css";

export const metadata = {
  title: "Mae Sister's Bouquet",
  description: "Home Page",
};

export default function LoginSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

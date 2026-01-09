import "./globals.css";

export const metadata = {
  title: "Quiz App",
  description: "CausalFunnel Quiz Assignment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

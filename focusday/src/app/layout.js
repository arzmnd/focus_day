import "./globals.css";

export const metadata = {
  title: "Focus Day",
  description: "Simplifica tu productividad. Una tarea. Tres prioridades. Cada día.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

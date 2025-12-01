import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THE WRETCHED - Interfaz de Supervivencia',
  description: 'Juego de rol en solitario de supervivencia espacial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}


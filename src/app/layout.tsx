import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CardQuant TH',
  description: 'ระบบติดตามราคาการ์ดสะสม',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-background text-text min-h-screen">{children}</body>
    </html>
  );
}

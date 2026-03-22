import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: "Tour Me Like It's Hot",
  description: 'Schedules, flights, transport and contacts for touring crew and bands',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: "Tour Me Like It's Hot" },
};

export const viewport: Viewport = {
  themeColor: '#0f0f12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-stage-page text-stage-fg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

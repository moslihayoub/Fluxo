import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import MetricsBar from '@/components/layout/MetricsBar';

import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthWrapper from '@/components/auth/AuthWrapper';
import PwaInstallPrompt from '@/components/ui/PwaInstallPrompt';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Fluxo — Vos flux financiers en toute simplicité',
  description: 'Application de gestion financière & trésorerie intelligente — suivez vos encaissements et décaissements en dirhams marocains (MAD)',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fluxo',
  },
  openGraph: {
    title: 'Fluxo — Vos flux financiers en toute simplicité',
    description: 'Application de gestion financière & trésorerie intelligente',
    images: ['/icon-512x512.png'],
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ce-theme') || 'dark';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <ThemeProvider>
          <AuthProvider>
            <AuthWrapper>
              <div className="flex flex-col min-h-screen pb-14 sm:pb-0 pt-[52px] sm:pt-0">
                <Header />
                <MobileNav />
                <main className="flex-1 pb-safe">
                  <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
                    {children}
                  </div>
                </main>
                <MetricsBar />
              </div>
              <Toaster position="bottom-center" />
              <PwaInstallPrompt />
            </AuthWrapper>
          </AuthProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

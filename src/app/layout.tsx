import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import MetricsBar from '@/components/layout/MetricsBar';
import Footer from '@/components/layout/Footer';
import FeedbackWidget from '@/components/widgets/FeedbackWidget';
import OfflineDetector from '@/components/tech/OfflineDetector';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthWrapper from '@/components/auth/AuthWrapper';
import PwaInstallPrompt from '@/components/ui/PwaInstallPrompt';
import { Toaster } from 'react-hot-toast';
import { cn } from "@/lib/utils";

// Font system fallback (équivalent visuel à Inter sur tous les OS)
// Sur macOS/iOS : San Francisco (SF Pro) ≈ Inter
// Sur Windows : Segoe UI ≈ Inter
// Sur Android : Roboto ≈ Inter
const inter = { variable: 'font-sans' };

export const metadata: Metadata = {
  metadataBase: new URL('https://fluxofinance.vercel.app'),
  title: {
    default: 'Fluxo — Vos flux financiers en toute simplicité',
    template: '%s | Fluxo'
  },
  description: 'Application de gestion financière et de facturation intelligente pour PME et auto-entrepreneurs au Maroc.',
  keywords: ['gestion financière', 'facturation', 'auto-entrepreneur', 'Maroc', 'devis', 'facture', 'trésorerie', 'TVA', 'IR', 'PWA'],
  authors: [{ name: 'Fluxo Team' }],
  creator: 'Fluxo',
  publisher: 'Fluxo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: 'index, follow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fluxo',
  },
  openGraph: {
    title: 'Fluxo — Vos flux financiers en toute simplicité',
    description: 'Application de gestion financière & trésorerie intelligente pour PME et indépendants.',
    url: 'https://fluxofinance.vercel.app',
    siteName: 'Fluxo',
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Fluxo Logo'
      }
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fluxo — Gestion Financière',
    description: 'Simplifiez votre facturation et votre trésorerie.',
    images: ['/icon-512x512.png'],
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Fluxo',
  url: 'https://fluxofinance.vercel.app',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'MAD',
  },
  description: 'Application de gestion financière, trésorerie et facturation pour indépendants et entreprises.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
              <div className="flex flex-col min-h-screen pb-14 sm:pb-0">
                <Header />
                <MobileNav />
                <main className="flex-1 pb-20 sm:pb-16">
                  <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
                    {children}
                  </div>
                </main>
                <Footer />
                <MetricsBar />
              </div>
              <Toaster position="top-center" />
              <PwaInstallPrompt />
              <FeedbackWidget />
              <OfflineDetector />
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

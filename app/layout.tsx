import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/components/context/AppContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileDrawer from '@/components/layout/MobileDrawer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import UserDrawer from '@/components/layout/UserDrawer';
import CountryModal from '@/components/layout/CountryModal';
import { getSystemSettings } from '@/lib/system-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings();
  const brandName = settings.brand_name || 'Quick Car Midlands Ltd';
  const tagline = settings.brand_tagline || 'UK Airport Transfer & Taxi Booking | Fixed Price Cabs';

  return {
    title: `${brandName} - ${tagline}`,
    description: `Book reliable UK airport transfers and long-distance taxis with ${brandName}. Fixed low fares, licensed drivers, meet & greet service, free flight monitoring.`,
    keywords: `airport transfers, taxi booking, heathrow taxi, gatwick transfer, stansted taxi, luton taxi, manchester airport taxi, ${brandName}, fixed price taxi uk`,
    authors: [{ name: `${brandName} Limited` }],
    icons: {
      icon: settings.logo_icon || '/favicon.ico',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#141720',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-poppins bg-[#f8f9fa] text-gray-800 antialiased min-h-screen flex flex-col selection:bg-ots-yellow selection:text-black pb-20 lg:pb-0">
        <AppProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <MobileDrawer />
          <MobileBottomNav />
          <UserDrawer />
          <CountryModal />
        </AppProvider>
      </body>
    </html>
  );
}

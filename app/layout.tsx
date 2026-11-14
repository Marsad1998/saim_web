import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/components/context/AppContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileDrawer from '@/components/layout/MobileDrawer';
import UserDrawer from '@/components/layout/UserDrawer';
import CountryModal from '@/components/layout/CountryModal';

export const metadata: Metadata = {
  title: 'OTS Taxi - UK Airport Transfer & Taxi Booking | Fixed Price Cabs',
  description: 'Book reliable UK airport transfers and long-distance taxis with OTS Taxi. Fixed low fares, licensed drivers, meet & greet service, free flight monitoring.',
  keywords: 'airport transfers, taxi booking, heathrow taxi, gatwick transfer, stansted taxi, luton taxi, manchester airport taxi, OTS taxi, fixed price taxi uk',
  authors: [{ name: 'OTS Taxi Limited' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FFCC00',
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
      <body className="font-poppins bg-[#f8f9fa] text-gray-800 antialiased min-h-screen flex flex-col selection:bg-ots-yellow selection:text-black">
        <AppProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <MobileDrawer />
          <UserDrawer />
          <CountryModal />
        </AppProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "./components/WhatsAppButton";
import ExitIntentPopup from "@/components/ExitIntentPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AirportTransfer Portal - Global Airport Transfers",
  description: "Book reliable airport transfers worldwide. Compare prices from local suppliers and book your ride in seconds.",
  keywords: "airport transfer, taxi, shuttle, private transfer, airport pickup, global transfers",
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#0d9488',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Airport Transfer',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <WhatsAppButton />
        <ExitIntentPopup
          allowedPaths={['/search', '/booking']}
          delay={5000}
          dismissDays={1}
        />
      </body>
    </html>
  );
}

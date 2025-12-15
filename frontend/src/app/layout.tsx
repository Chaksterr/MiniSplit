import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ['400', '500', '600', '700', '800'],
});

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "MiniSplit - Partagez vos dépenses facilement",
  description: "Gérez vos dépenses de groupe, suivez les balances et réglez vos comptes en toute simplicité",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50 text-gray-900 min-h-screen" style={{ fontFamily: 'var(--font-jakarta)' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

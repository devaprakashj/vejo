import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import { SearchDrawer } from "@/components/layout/SearchDrawer";
import { MobileMenuDrawer } from "@/components/layout/MobileMenuDrawer";
import { FacebookPixel } from "@/components/FacebookPixel";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "VEJO Studio | Premium Essentials",
  description: "Sustainable, minimalist essentials for the modern home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.variable} overflow-x-hidden w-full flex flex-col min-h-screen`}>
        <Header />
        <CartDrawer />
        <SearchDrawer />
        <MobileMenuDrawer />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <FacebookPixel />
      </body>
    </html>
  );
}

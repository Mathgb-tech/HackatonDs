import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GestanteProvider } from "@/context/GestanteContext";
import AppShell from "@/components/AppShell";
import LgpdModal from "@/components/LgpdModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pré-Natal Ativo",
  description: "Prioritization tool for Brazilian public health workers coordinating active outreach to pregnant women.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GestanteProvider>
          <LgpdModal />
          <AppShell>
            {children}
          </AppShell>
        </GestanteProvider>
      </body>
    </html>
  );
}

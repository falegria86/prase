import type { Metadata } from "next";
import localFont from "next/font/local";
import { LazyMotion, domAnimation } from "framer-motion"
import "./globals.css";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PRASE",
  description: "Sistema administrador de seguros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LazyMotion features={domAnimation}>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster />
        </LazyMotion>
        <div id="portal-root"></div>
      </body>
    </html>
  );
}

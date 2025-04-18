import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";
import Script from "next/script";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import BetaBanner from "@/components/BetaBanner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planning Poker",
  description: "A modern estimation tool for quick and effective sprint planning with your team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
              // Sadece localhost olmayan ortamlarda çalıştır
              if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              }
          })(window, document, "clarity", "script", "r4y5ylthf0");
        `}
      </Script>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <BetaBanner />
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

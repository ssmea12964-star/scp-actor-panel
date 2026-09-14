import type { Metadata } from "next";
import { Chakra_Petch, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/providers";

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-chakra",
});
const jbmono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SCP Vakıası — Aktörlük Kontrol Terminali",
  description: "SCP Roleplay topluluğu için Aktörlük & Rapor Yönetim Paneli",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${chakra.variable} ${jbmono.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans">
        <Providers>
          {children}
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#0e1216",
                border: "1px solid #20252a",
                color: "#c9d1d9",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

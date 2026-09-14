"use client";

import { signIn } from "next-auth/react";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-4">
      <div className="absolute inset-0 bg-grid-scan bg-grid opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-noise-radial" />

      <div className="relative w-full max-w-md">
        <div className="glass-panel clip-corner overflow-hidden">
          <div className="border-b border-steel-800/70 bg-breach/10 px-6 py-3">
            <p className="terminal-label flex items-center gap-2 text-breach-glow">
              <ShieldAlert className="h-3.5 w-3.5" />
              KISITLI ERİŞİM — YETKİ DOĞRULAMASI GEREKLİ
            </p>
          </div>

          <div className="space-y-6 px-8 py-10 text-center">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wide text-steel-100">
                AKTÖRLÜK KONTROL TERMİNALİ
              </h1>
              <p className="mt-2 text-sm text-steel-300">
                Devam etmek için Vakıa kimlik doğrulama sunucusuna (Discord) bağlanın.
              </p>
            </div>

            <button
              onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
              className="group flex w-full items-center justify-center gap-3 rounded-md border border-secure/40 bg-secure/10 px-4 py-3 font-medium text-secure-glow transition-all hover:bg-secure/20 hover:shadow-glow-green"
            >
              <svg className="h-5 w-5" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              Discord ile Giriş Yap
            </button>

            <p className="font-mono text-[11px] leading-relaxed text-steel-500">
              Bu terminal, SCP Vakıası Roleplay sunucusu üyelik ve rol verilerinize
              erişim talep eder. Erişim seviyeniz sunucudaki rolünüze göre otomatik
              belirlenir.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-steel-600">
          KAYIT NO. 2317-ACS · SÜREKLİ GÖZETİM ALTINDADIR
        </p>
      </div>
    </main>
  );
}

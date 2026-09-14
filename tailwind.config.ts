import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-chakra)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        void: {
          DEFAULT: "#07090b",
          950: "#0a0d10",
          900: "#0e1216",
          850: "#12171c",
          800: "#161c22",
        },
        steel: {
          100: "#c9d1d9",
          300: "#8b949e",
          500: "#5b636b",
          700: "#31373d",
          800: "#20252a",
        },
        breach: {
          DEFAULT: "#e4232f",
          dim: "#8a1620",
          glow: "#ff3b48",
        },
        secure: {
          DEFAULT: "#1fd67a",
          dim: "#15563a",
          glow: "#39ff9c",
        },
        amber: {
          DEFAULT: "#e2a336",
        },
      },
      backgroundImage: {
        "grid-scan":
          "linear-gradient(rgba(31,214,122,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(31,214,122,0.045) 1px, transparent 1px)",
        "noise-radial":
          "radial-gradient(circle at 20% -10%, rgba(228,35,47,0.10), transparent 45%), radial-gradient(circle at 90% 10%, rgba(31,214,122,0.08), transparent 40%)",
      },
      backgroundSize: {
        grid: "42px 42px",
      },
      boxShadow: {
        "glass-edge": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
        "glow-red": "0 0 24px rgba(228,35,47,0.35)",
        "glow-green": "0 0 24px rgba(31,214,122,0.30)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%,100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.4" },
          "94%": { opacity: "1" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        scanline: "scanline 6s linear infinite",
        flicker: "flicker 5s infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

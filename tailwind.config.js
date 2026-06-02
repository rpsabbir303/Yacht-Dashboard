/** @type {import('tailwindcss').Config} */

/* ---------------------------------------------------------------
   Meridian admin palette — cool-dark, single teal accent

   Strict tokens (do not introduce ad-hoc shades in components):
     bg            #050B14   page background
     card          #0F1724   card / panel background
     surface high  #151E2D   raised surface / secondary card
     accent        #22C7B8   single accent
     text primary  #FFFFFF
     text secondary#94A3B8   (grey-400)
     text muted    #6B7280   (grey-500) — labels, metadata, timestamps
     border        rgba(255,255,255,0.08)
     border hover  rgba(34,199,184,0.35)
     hover overlay rgba(255,255,255,0.05)
---------------------------------------------------------------- */
const ink = "#050B14";
const surface = "#0F1724";
const slate = "#151E2D";
const teal = "#22C7B8";
const grey = "#94A3B8";
const gold = "#D4B25F";
const danger = "#AA2727";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Canonical tokens */
        ink: {
          DEFAULT: ink,
          50: "#f5f5f6",
          100: "#e4e4e7",
          200: "#cccdd1",
          300: "#9a9ca3",
          400: "#5b5e66",
          500: "#33363c",
          600: surface,
          700: "#121418",
          800: "#0f1115",
          900: ink,
          950: "#08090b",
        },
        surface: {
          DEFAULT: surface,
          soft: "#0B1320",
          card: surface,
          high: "#1A2335",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          subtle: "rgba(255,255,255,0.05)",
          strong: "rgba(255,255,255,0.12)",
          hover: "rgba(34,199,184,0.35)",
          slate: slate,
        },
        teal: {
          50: "#ecfdf9",
          100: "#cff8ec",
          200: "#9ff0d8",
          300: "#5fe3c6",
          400: "#3dd5b6",
          500: teal,
          600: "#179a92",
          700: "#12807a",
          800: "#0f6864",
          900: "#0e4f4d",
        },
        grey: {
          DEFAULT: grey,
          300: "#CBD5E1",
          400: "#94A3B8", // Secondary text (cool slate)
          500: "#64748B", // Muted text — labels, timestamps, metadata
          600: "#475569", // Very muted — disabled, decorative icons
        },
        gold: {
          300: "#E5C77F",
          400: "#D9BE7A",
          500: gold, // #D4B25F — warning indicators / premium accent
          600: "#9D8246",
        },
        danger: {
          DEFAULT: danger,
          400: "#C24545",
          500: danger,
          600: "#8B1F1F",
        },

        /* Legacy aliases — kept so existing component classes resolve to
           the new minimal palette without sweeping renames. */
        navy: {
          50: "#f5f5f6",
          100: "#e4e4e7",
          200: "#cccdd1",
          300: "#9a9ca3",
          400: "#5b5e66",
          500: "#33363c",
          600: slate,
          700: "#1F2329",
          800: surface,
          900: ink,
          950: "#08090b",
        },
        ocean: {
          50: "#ecfdf9",
          100: "#cff8ec",
          200: "#9ff0d8",
          300: "#5fe3c6",
          400: "#3dd5b6",
          500: teal,
          600: "#179a92",
          700: "#12807a",
          800: "#0f6864",
          900: "#0e4f4d",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      letterSpacing: {
        eyebrow: "0.18em",
        tighter2: "-0.02em",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "20px",
        "3xl": "24px",
        "4xl": "28px",
      },
      boxShadow: {
        /* Very soft elevation — never neon. */
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 30px -18px rgba(0,0,0,0.6)",
        elevated:
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -28px rgba(0,0,0,0.8)",
        glow: "0 8px 24px -10px rgba(34,199,184,0.45)",
        glass:
          "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 30px -18px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        /* Kept purely as a subtle texture; not used as the main bg anymore. */
        "noise-soft":
          "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-800px 0" },
          "100%": { backgroundPosition: "800px 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        fadeIn: "fadeIn 0.35s ease-out both",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Ant Design has its own reset
  },
};

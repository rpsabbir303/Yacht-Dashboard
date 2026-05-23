/** @type {import('tailwindcss').Config} */

/* ---------------------------------------------------------------
   Minimal luxury palette — Linear x Stripe x Yacht
---------------------------------------------------------------- */
const ink = "#0D0F12"; // Page background
const surface = "#171A1F"; // Card background
const slate = "#2A2E34"; // Borders, hovers, dividers
const teal = "#14B8A6"; // Single accent
const grey = "#A1A1AA"; // Secondary text
const gold = "#C6A75E"; // Reserved for premium / verification
const danger = "#AA2727"; // Rejections / destructive

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
          soft: "#13161A",
          card: surface,
          high: "#1F2329",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.05)",
          strong: "rgba(255,255,255,0.08)",
          slate: slate,
        },
        teal: {
          50: "#ecfdf7",
          100: "#cffaf0",
          200: "#9ff3df",
          300: "#5fe5c8",
          400: "#2dd2b0",
          500: teal,
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        grey: {
          DEFAULT: grey,
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
        },
        gold: {
          400: "#D9BE7A",
          500: gold,
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
          50: "#ecfdf7",
          100: "#cffaf0",
          200: "#9ff3df",
          300: "#5fe5c8",
          400: "#2dd2b0",
          500: teal,
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
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
        glow: "0 8px 24px -10px rgba(20,184,166,0.45)",
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

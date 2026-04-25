import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // Primary — dark teal green #1E6B5A
        primary: {
          DEFAULT: "#1E6B5A",
          foreground: "#FFFFFF",
          50:  "#E6F4F0",
          100: "#C0E3D9",
          500: "#1E6B5A",
          600: "#175849",
          700: "#104038",
        },
        // Teal — bright mint accent #25C48A
        teal: {
          DEFAULT: "#25C48A",
          foreground: "#FFFFFF",
          50:  "#E1F9F0",
          100: "#A3EDD0",
          400: "#2FD99A",
          500: "#25C48A",
          600: "#1DA872",
        },
        // Accent — orange CTA #FF8C42
        accent: {
          DEFAULT: "#FF8C42",
          foreground: "#FFFFFF",
          50:  "#FFF3EA",
          100: "#FFD9B8",
          500: "#FF8C42",
          600: "#E6702A",
        },
        // Navy — hero background
        navy: {
          DEFAULT: "#1A2B3C",
          dark:    "#0F1C2B",
          light:   "#1E3347",
        },
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [animate],
};

export default config;

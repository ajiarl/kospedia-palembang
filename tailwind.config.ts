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
        primary: {
          DEFAULT: "#C84B31",
          foreground: "#FFFFFF",
          50:  "#FDEBD6",
          100: "#FAD0B8",
          500: "#C84B31",
          600: "#A83A24",
          700: "#882E1B",
        },
        coral: {
          DEFAULT: "#F08060",
          foreground: "#FFFFFF",
          50:  "#FEF0EB",
          100: "#FBBDAD",
          400: "#F08060",
          500: "#E86840",
        },
        forest: {
          DEFAULT: "#2D4A3E",
          foreground: "#FFFFFF",
          50:  "#EDF3F0",
          100: "#C8DDD6",
          500: "#2D4A3E",
          600: "#243D33",
        },
        sand: {
          DEFAULT: "#F5F0EB",
          dark:    "#EAE2D8",
        },
        charcoal: {
          DEFAULT: "#1C1917",
          dark:    "#111110",
          light:   "#25201D",
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
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
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

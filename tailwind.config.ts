import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs dynamiques basées sur les variables CSS
        base: "var(--bg-base)",
        card: "var(--bg-card)",
        "card-hover": "var(--bg-card-hover)",
        elevated: "var(--bg-elevated)",
        code: "var(--bg-code)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        
        // Accents VITA
        violet: {
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
          dark: "#7c3aed",
        },
        pink: {
          DEFAULT: "#ec4899",
          light: "#f472b6",
          dark: "#db2777",
        },
        cyan: {
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
          dark: "#0891b2",
        },
        green: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
        orange: {
          DEFAULT: "#f97316",
          light: "#fb923c",
          dark: "#ea580c",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #8b5cf6, #ec4899)",
        "gradient-cyan": "linear-gradient(135deg, #06b6d4, #3b82f6)",
        "gradient-green": "linear-gradient(135deg, #10b981, #06b6d4)",
        "gradient-orange": "linear-gradient(135deg, #f97316, #ec4899)",
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
      },
      animation: {
        "pulse-marker": "pulse-marker 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-marker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

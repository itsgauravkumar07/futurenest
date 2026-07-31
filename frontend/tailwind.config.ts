import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Deep navy-indigo — the brand's "we verify, we vouch" trust color.
        // Deliberately not black/near-black — this is a document-and-ledger
        // navy, not a tech-startup dark mode.
        ink: {
          DEFAULT: "#12213B",
          50: "#F3F5F8",
          100: "#E2E7EE",
          400: "#4B5D7E",
          700: "#1B2E4D",
          900: "#0B1526",
        },
        // Warm paper background — the base surface everything sits on.
        paper: {
          DEFAULT: "#F7F4EE",
          dim: "#EFEADF",
        },
        // Ochre/clay accent — property, warmth, "home" — chosen instead of
        // the terracotta/#D97757 that's become an AI-generated design tell.
        accent: {
          DEFAULT: "#C98A3B",
          dark: "#A16A24",
          light: "#E5C594",
        },
        slate: {
          DEFAULT: "#5B6472",
          light: "#8A93A0",
        },
        // Status colors used across property/lead/plan states
        leaf: {
          DEFAULT: "#3F6B4E", // approved / active / qualified
          light: "#E4EEE6",
        },
        brick: {
          DEFAULT: "#9B4444", // rejected / expired / disqualified
          light: "#F3E4E2",
        },
        amber: {
          DEFAULT: "#B8862F", // pending
          light: "#F5EBD8",
        },
        line: "#DAD3C4",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18, 33, 59, 0.06), 0 1px 1px rgba(18, 33, 59, 0.04)",
        lifted: "0 8px 24px rgba(18, 33, 59, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;

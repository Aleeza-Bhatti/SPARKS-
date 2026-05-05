import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // V1 brand palette
        brand:    "#660C0D",
        "brand-soft": "rgba(102,12,13,0.55)",
        cream:    "#FFFCF8",
        "card-bg": "rgba(255,252,248,0.85)",
        "warm-line": "rgba(102,12,13,0.1)",
        // Keep these for any components still using them
        sage:      "#660C0D",
        terracotta:"#a35a57",
        "brand-amber": "#c97d52",
      },
      fontFamily: {
        sans:    ["Urbanist", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
        heading: ["Cormorant Garamond", "Georgia", "serif"],
        detail:  ["Barlow Condensed", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    // Hide scrollbars while keeping scroll functionality
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        ".scrollbar-none": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".scrollbar-none::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
};

export default config;

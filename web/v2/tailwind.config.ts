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
        // High-contrast sunset palette
        brand:    "#5A171A",
        "brand-soft": "#8A3F37",
        cream:    "#FFFCF8",
        "card-bg": "rgba(255,252,248,0.85)",
        "warm-line": "#E5BE9A",
        // Keep these for any components still using them
        sage:      "#5A171A",
        terracotta:"#C96F35",
        "brand-amber": "#F2A15F",
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

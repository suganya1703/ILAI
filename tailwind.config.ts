import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F6F2E6",
          green: "#506638",
          hover: "#3E512B",
          accent: "#E8A2A4",
          surface: "#FFFFFF",
          text: "#263618",
          muted: "#5F6F50",
          border: "#E2DCCB",
          soft: "#EDE8D8",
        },
      },
    },
  },
  plugins: [],
};
export default config;

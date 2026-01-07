import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // GOTCHA 디자인 시스템
        main: {
          "900": "#D61D1B",
          "800": "#E22723",
          "700": "#F43329",
          "600": "#FF3E27",
          "500": "#FF4545",
          "400": "#FF4545",
          "300": "#F3726E",
          "200": "#FA9A97",
          "100": "#FFCDD1",
          "50": "#FFEBEE",
          DEFAULT: "#FF4545",
        },
        grey: {
          "900": "#121213",
          "800": "#323233",
          "700": "#626264",
          "600": "#626264",
          "500": "#8A8A8B",
          "400": "#ABABAC",
          "300": "#CCCCCD",
          "200": "#E2E2E3",
          "100": "#EEEEEF",
          "50": "#F7F7F9",
          white: "#FFFFFF",
        },
        line: {
          "800": "#323233",
          "300": "#CCCCCD",
          "100": "#EEEEEF",
        },
        success: {
          DEFAULT: "#02BD79",
          light: "#E0F7EF",
        },
        error: {
          DEFAULT: "#FF3E27",
          light: "#FFEBEE",
        },
      },
      backgroundColor: {
        default: "#FDFEFF", // bg-default
        white: "#FFFFFF", // bg-white (GOTCHA white)
        grey: "#F7F7F9", // bg-grey
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
  ],
};
export default config;

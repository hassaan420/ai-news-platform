const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        // Material Design / Surface tokens
        "outline": "hsl(var(--outline) / <alpha-value>)",
        "surface-container-lowest": "hsl(var(--surface-container-lowest) / <alpha-value>)",
        "inverse-surface": "hsl(var(--inverse-surface) / <alpha-value>)",
        "on-secondary-fixed": "hsl(var(--on-secondary-fixed) / <alpha-value>)",
        "surface": "hsl(var(--surface) / <alpha-value>)",
        "surface-container": "hsl(var(--surface-container) / <alpha-value>)",
        "tertiary-fixed": "hsl(var(--tertiary-fixed) / <alpha-value>)",
        "primary-fixed-dim": "hsl(var(--primary-fixed-dim) / <alpha-value>)",
        "on-primary": "hsl(var(--on-primary) / <alpha-value>)",
        "surface-container-high": "hsl(var(--surface-container-high) / <alpha-value>)",
        "secondary-fixed-dim": "hsl(var(--secondary-fixed-dim) / <alpha-value>)",
        "on-error-container": "hsl(var(--on-error-container) / <alpha-value>)",
        "surface-variant": "hsl(var(--surface-variant) / <alpha-value>)",
        "outline-variant": "hsl(var(--outline-variant) / <alpha-value>)",
        "secondary-container": "hsl(var(--secondary-container) / <alpha-value>)",
        "on-secondary-fixed-variant": "hsl(var(--on-secondary-fixed-variant) / <alpha-value>)",
        "on-tertiary-fixed-variant": "hsl(var(--on-tertiary-fixed-variant) / <alpha-value>)",
        "on-background": "hsl(var(--on-background) / <alpha-value>)",
        "surface-container-highest": "hsl(var(--surface-container-highest) / <alpha-value>)",
        "tertiary": "hsl(var(--tertiary) / <alpha-value>)",
        "surface-dim": "hsl(var(--surface-dim) / <alpha-value>)",
        "error-container": "hsl(var(--error-container) / <alpha-value>)",
        "on-surface-variant": "hsl(var(--on-surface-variant) / <alpha-value>)",
        "tertiary-fixed-dim": "hsl(var(--tertiary-fixed-dim) / <alpha-value>)",
        "on-primary-fixed": "hsl(var(--on-primary-fixed) / <alpha-value>)",
        "tertiary-container": "hsl(var(--tertiary-container) / <alpha-value>)",
        "on-secondary": "hsl(var(--on-secondary) / <alpha-value>)",
        "primary-fixed": "hsl(var(--primary-fixed) / <alpha-value>)",
        "surface-bright": "hsl(var(--surface-bright) / <alpha-value>)",
        "on-secondary-container": "hsl(var(--on-secondary-container) / <alpha-value>)",
        "secondary-fixed": "hsl(var(--secondary-fixed) / <alpha-value>)",
        "on-surface": "hsl(var(--on-surface) / <alpha-value>)",
        "primary-container": "hsl(var(--primary-container) / <alpha-value>)",
        "on-primary-container": "hsl(var(--on-primary-container) / <alpha-value>)",
        "on-tertiary": "hsl(var(--on-tertiary) / <alpha-value>)",
        "inverse-primary": "hsl(var(--inverse-primary) / <alpha-value>)",
        "surface-container-low": "hsl(var(--surface-container-low) / <alpha-value>)",
        "error": "hsl(var(--error) / <alpha-value>)",
        "on-error": "hsl(var(--on-error) / <alpha-value>)",
        "on-tertiary-container": "hsl(var(--on-tertiary-container) / <alpha-value>)",
        "surface-tint": "hsl(var(--surface-tint) / <alpha-value>)",
        "on-primary-fixed-variant": "hsl(var(--on-primary-fixed-variant) / <alpha-value>)",
        "inverse-on-surface": "hsl(var(--inverse-on-surface) / <alpha-value>)",
        "on-tertiary-fixed": "hsl(var(--on-tertiary-fixed) / <alpha-value>)"
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      },
      spacing: {
        margin_desktop: "40px",
        stack_sm: "8px",
        max_content_width: "1200px",
        stack_md: "16px",
        margin_mobile: "16px",
        stack_lg: "32px",
        gutter: "24px",
        sidebar_width: "280px"
      },
      fontFamily: {
        sans: ["'Hanken Grotesk'", "Inter", ...fontFamily.sans],
        "metadata": ["'Hanken Grotesk'", "Inter", ...fontFamily.sans],
        "display-lg-mobile": ["'Source Serif 4'", "Georgia", "serif"],
        "label-sm": ["'Hanken Grotesk'", "Inter", ...fontFamily.sans],
        "display-lg": ["'Source Serif 4'", "Georgia", "serif"],
        "body-lg": ["'Hanken Grotesk'", "Inter", ...fontFamily.sans],
        "headline-md": ["'Source Serif 4'", "Georgia", "serif"],
        "body-md": ["'Hanken Grotesk'", "Inter", ...fontFamily.sans],
        serif: ["'Source Serif 4'", "Georgia", "serif"],
      },
      fontSize: {
        "metadata": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "display-lg-mobile": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "label-sm": ["13px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "600" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      },
      boxShadow: {
        'premium': '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        'premium-hover': '0 4px 12px rgba(0,0,0,0.07), 0 12px 36px rgba(0,0,0,0.06)',
        'subtle': '0 1px 2px rgba(0,0,0,0.04)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

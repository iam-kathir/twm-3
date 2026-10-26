/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-raised": "rgb(var(--surface-elevated-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        "ink-secondary": "rgb(var(--ink-secondary-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        "muted-soft": "rgb(var(--muted-soft-rgb) / <alpha-value>)",
        "muted-dark": "rgb(var(--muted-dark-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-hover": "rgb(var(--accent-hover-rgb) / <alpha-value>)",
        "provider-github": "rgb(var(--provider-github-rgb) / <alpha-value>)",
        "provider-leetcode": "rgb(var(--provider-leetcode-rgb) / <alpha-value>)",
        "provider-leetcode-brand": "rgb(var(--provider-leetcode-brand-rgb) / <alpha-value>)",
        "provider-hackerrank": "rgb(var(--provider-hackerrank-rgb) / <alpha-value>)",
        "status-verified": "rgb(var(--status-verified-rgb) / <alpha-value>)",
        "status-warning": "rgb(var(--status-warning-rgb) / <alpha-value>)",
        "status-error": "rgb(var(--status-error-rgb) / <alpha-value>)",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        overlay: "var(--shadow-overlay)",
      },
      borderRadius: {
        panel: "var(--radius-panel)",
        control: "var(--radius-control)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "'Helvetica Neue'", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "'Liberation Mono'", "'Courier New'", "monospace"],
      },
    },
  },
  plugins: [],
};

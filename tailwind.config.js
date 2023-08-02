/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      sans: [
        "Inter var, sans-serif",
        {
          fontFeatureSettings: '"cv11", "ss01"',
          fontVariationSettings: '"opsz" 32'
        },
      ],
    },
    animation: {
      "fade-in-right":
        "fade-in-right 1s cubic-bezier(0.390, 0.575, 0.565, 1.000)   both",
      "fade-in-left":
        "fade-in-left 1s cubic-bezier(0.390, 0.575, 0.565, 1.000)   both",
      "scale-in-center":
        "scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940)   both",
    },
    keyframes: {
      "fade-in-right": {
        "0%": {
          transform: "translateX(50px)",
          opacity: "0",
        },
        to: {
          transform: "translateX(0)",
          opacity: "1",
        },
      },
      "fade-in-left": {
        "0%": {
          transform: "translateX(-50px)",
          opacity: "0",
        },
        to: {
          transform: "translateX(0)",
          opacity: "1",
        },
      },
      "scale-in-center": {
        "0%": {
          transform: "scale(0)",
          opacity: "1",
        },
        to: {
          transform: "scale(1)",
          opacity: "1",
        },
      },
    },
    extend: {},
  },
  plugins: [],
}


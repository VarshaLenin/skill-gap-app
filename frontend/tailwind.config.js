/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Soft UI, evolved: cool lavender-grey ground, dual-tone soft
        // shadows carry all elevation, deep navy ink keeps text readable
        // (classic neumorphism's grey-on-grey text failed accessibility --
        // this fixes that while keeping the tactile, pressed/raised feel).
        base: "#E9EDF5",
        surface: "#F6F8FC",
        surfaceDeep: "#E3E8F2",
        ink: "#242B3D",
        muted: "#6E7891",
        line: "#D7DEEA",
        primary: "#5A63E8",
        primarySoft: "#E4E5FC",
        warm: "#F0704F",
        warmSoft: "#FCE3DA",
        shadowLight: "#FFFFFF",
        shadowDark: "#B7C0D4",
      },
      fontFamily: {
        display: ["Outfit", "Helvetica Neue", "Arial", "sans-serif"],
        sans: ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "26px",
        control: "18px",
      },
      boxShadow: {
        raised: "9px 9px 18px #B7C0D4, -9px -9px 18px #FFFFFF",
        "raised-sm": "5px 5px 11px #B7C0D4, -5px -5px 11px #FFFFFF",
        "raised-xs": "3px 3px 7px #B7C0D4, -3px -3px 7px #FFFFFF",
        pressed: "inset 4px 4px 9px #B7C0D4, inset -4px -4px 9px #FFFFFF",
        "pressed-sm": "inset 2px 2px 5px #B7C0D4, inset -2px -2px 5px #FFFFFF",
        float: "0 24px 48px -16px rgba(36, 43, 61, 0.22)",
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Soft UI, evolved: cool lavender-grey ground, dual-tone soft
        // shadows carry all elevation, deep navy ink keeps text readable
        // (classic neumorphism's grey-on-grey text failed accessibility --
        // this fixes that while keeping the tactile, pressed/raised feel).
        base: "#E9EDF5",
        surface: "#F6F8FC",
        surfaceDeep: "#E3E8F2",
        ink: "#242B3D",
        muted: "#6E7891",
        line: "#D7DEEA",
        primary: "#5A63E8",
        primarySoft: "#E4E5FC",
        warm: "#F0704F",
        warmSoft: "#FCE3DA",
        shadowLight: "#FFFFFF",
        shadowDark: "#B7C0D4",
      },
      fontFamily: {
        display: ["Outfit", "Helvetica Neue", "Arial", "sans-serif"],
        sans: ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "26px",
        control: "18px",
      },
      boxShadow: {
        raised: "9px 9px 18px #B7C0D4, -9px -9px 18px #FFFFFF",
        "raised-sm": "5px 5px 11px #B7C0D4, -5px -5px 11px #FFFFFF",
        "raised-xs": "3px 3px 7px #B7C0D4, -3px -3px 7px #FFFFFF",
        pressed: "inset 4px 4px 9px #B7C0D4, inset -4px -4px 9px #FFFFFF",
        "pressed-sm": "inset 2px 2px 5px #B7C0D4, inset -2px -2px 5px #FFFFFF",
        float: "0 24px 48px -16px rgba(36, 43, 61, 0.22)",
      },
    },
  },
  plugins: [],
};

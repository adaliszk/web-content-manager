import daisyui from "daisyui";
import type { Config } from "tailwindcss";

const colors = {
    palatinate: {
        100: "#d6daff",
        200: "#adb5ff",
        300: "#848fff",
        400: "#5b6aff",
        500: "#3245FF",
        600: "#2837cc",
        700: "#1E2999",
        800: "#141c66",
        900: "#050719",
    },
    orchid: {
        100: "#edd1f6",
        200: "#daa3ed",
        300: "#c876e3",
        400: "#b548da",
        500: "#a31ad1",
        600: "#8215a7",
        700: "#872b99",
        800: "#410a54",
        900: "#21052a",
    },
    salsa: "#ff3245",
    banana: "#ffec32",
    kiwi: "#7aed45",
};

// noinspection JSUnusedGlobalSymbols
export default {
    content: ["./src/**/*.{astro,css,tsx}"],
    plugins: [daisyui],
    darkMode: "selector",
    daisyui: {
        theme: ["light", "dark"],
        logs: false,
    },
    theme: {
        colors: {
            transparent: "transparent",
            black: "#000000",
            white: "#ffffff",
            primary: colors.palatinate,
            ...colors,
        },
        extend: {},
        groupLevel: 3,
        groupScope: "scope",
        groupVariants: ["hover", "focus"],
    },
} satisfies Config;

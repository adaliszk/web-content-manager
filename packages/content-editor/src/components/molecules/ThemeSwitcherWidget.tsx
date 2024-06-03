import { type PropsOf, Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export const ThemeSwitcherApi = {
    restoreState() {
        const savedTheme = localStorage.getItem("cmsTheme");
        const darkMode = !savedTheme
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
            : savedTheme === "dark";
        this.applyTheme(darkMode ? "dark" : "light");
        return darkMode;
    },
    applyTheme(theme: string) {
        localStorage.setItem("cmsTheme", theme);
        localStorage.setItem("astroErrorOverlayTheme", theme);
        document.body.classList.add("theme-change");
        document.body.dataset.theme = theme;
        setTimeout(() => {
            document.body.classList.remove("theme-change");
        }, 100);
    },
};

export type ThemeSwitcherWidgetProps = PropsOf<"label"> & {
    darkMode?: boolean;
};

export const ThemeSwitcherWidget = component$<ThemeSwitcherWidgetProps>(({ darkMode }) => {
    const isDark = useSignal(darkMode);
    useVisibleTask$(() => {
        isDark.value = ThemeSwitcherApi.restoreState();
    });
    return (
        <label
            class="swap swap-rotate hover:bg-base-100 p-1 rounded-2xl"
            data-theme-changer={"widget"}
            for={"theme-switcher-input"}>
            <input
                type="checkbox"
                id={"theme-switcher-input"}
                class="theme-controller"
                checked={isDark.value === true}
                value={"darkMode"}
                onChange$={(ev) => {
                    const target = ev.target as HTMLInputElement;
                    const darkMode = target.checked;
                    ThemeSwitcherApi.applyTheme(darkMode ? "dark" : "light");
                }}
            />
            <span
                class={twMerge(
                    "fill-current w-8 h-8 flex items-center justify-center",
                    isDark.value !== undefined && "opacity-0",
                )}>
                <Slot name={"theme-icon"} />
            </span>
            <span
                class={twMerge(
                    "swap-off fill-current w-8 h-8 flex items-center justify-center",
                    isDark.value === undefined && "opacity-0",
                )}>
                <Slot name={"light-icon"} />
            </span>
            <span
                class={twMerge(
                    "swap-on fill-current w-8 h-8 flex items-center justify-center",
                    isDark.value === undefined && "opacity-0",
                )}>
                <Slot name={"dark-icon"} />
            </span>
        </label>
    );
});

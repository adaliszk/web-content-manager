import type { PropsOf } from "@builder.io/qwik";

import { Slot, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export const Select = component$<PropsOf<"select">>(({ class: classList, ...props }) => {
    return (
        <select
            {...props}
            class={twMerge("select select-sm rounded w-full max-w-xs", classList?.toString())}>
            <Slot />
        </select>
    );
});

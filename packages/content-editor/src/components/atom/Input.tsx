import type { JSXOutput, PropsOf } from "@builder.io/qwik";

import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export type InputProps = PropsOf<"input"> & {
    prefix?: JSXOutput;
    suffix?: JSXOutput;
};

export const Input = component$<InputProps>(({ prefix, suffix, class: classList, ...props }) => {
    return (
        <label
            class={twMerge(
                "input input-bordered pr-0 overflow-hidden flex items-center w-full",
                classList?.toString(),
            )}>
            {prefix}
            <input {...props} class={"grow"} />
            {suffix}
        </label>
    );
});

import { type PropsOf, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import { Input } from "~/components/atom/Input.tsx";

export type SearchWidgetProps = Omit<
    PropsOf<"input">,
    "type" | "bind:checked" | "popovertarget" | "popovertargetaction"
>;

export const SearchWidget = component$<SearchWidgetProps>(
    ({ placeholder, class: classList, ...props }) => {
        return (
            <div class="absolute top-2 left-1/2 -translate-x-1/2 w-1/3">
                <Input
                    {...props}
                    class={twMerge("input-sm w-full", classList?.toString())}
                    placeholder={placeholder ?? "Search for..."}
                    type="text"
                    suffix={
                        <kbd
                            q:slot={"suffix"}
                            class="kbd border-t-0 border-r-0 border-b-0 rounded-none px-3 w-24 flex flex-row items-center">
                            <span class={"inline-block"}>SHIFT</span>
                            <span class={"inline-block px-1 relative top-[-1px] text-xs"}>+</span>
                            <span class={"inline-block"}>K</span>
                        </kbd>
                    }
                />
            </div>
        );
    },
);

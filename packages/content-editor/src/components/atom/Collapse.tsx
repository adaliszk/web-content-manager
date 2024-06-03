import { matchByValue } from "@adaliszk/std";
import { type PropsOf, Slot, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export type CollapseProps = PropsOf<"section"> & {
    mode: "toggle" | "select" | "focus";
    group: string;
    value: string;
    open?: boolean;
};

export const Collapse = component$<CollapseProps>(
    ({ mode, group, value, open, class: classList, ...props }) => {
        const inputId = `${group}-input`;
        // ! TODO: Remember the state using a nano-store
        const ControlFlow = matchByValue(mode, {
            select: () => (
                <input id={inputId} type={"radio"} name={group} value={value} class={"hidden"} />
            ),
            toggle: () => <input id={inputId} type={"checkbox"} value={value} class={"hidden"} />,
            focus: () => "",
        }).unwrap() as string; // TODO: Drop type casting once the std types are resolved correctly

        return (
            <section
                {...props}
                class={twMerge(
                    twMerge("collapse rounded-md flex-grow", open === true && "collapse-open"),
                    classList?.toString(),
                )}>
                {ControlFlow}
                <label
                    class={"collapse-title p-1 rounded-none min-h-0 h-10 cursor-pointer group"}
                    for={inputId}>
                    <div class="flex flex-row items-center">
                        <Slot name={"header"} />
                    </div>
                </label>
                <div class="collapse-content rounded-none -mx-1">
                    <Slot />
                </div>
            </section>
        );
    },
);

import { createULIDLike } from "@adaliszk/std";
import { type PropsOf, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import type { CollectionReference, CollectionType } from "~/app/types.ts";
import { Icon } from "~/components.ts";
import { routeTo } from "~/router.ts";
import type { CollectionEntryItem } from "./CollectionManager.tsx";

export type CollectionEntryProps = PropsOf<"article"> & {
    entry: CollectionEntryItem;
    collection: CollectionReference;
    variant: CollectionType;
};

export const CollectionManagerEntry = component$<CollectionEntryProps>(
    ({ variant, collection, entry, class: classList }) => {
        return (
            <article
                class={twMerge(
                    "flex flex-row gap-2 items-center group h-8 p-1 -mx-1",
                    "rounded-md bg-base-200/0 hover:bg-base-200/50",
                    "dark:bg-base-200/0 dark:hover:bg-base-200/50",
                    classList?.toString(),
                )}>
                <div class={"relative -top-0.5"}>
                    <Icon name={"file"} size={18} />
                </div>
                <a
                    href={routeTo.openTab(variant, createULIDLike(collection).unwrap(), entry.id)}
                    class={twMerge(
                        "flex-grow",
                        "opacity-80 dark:opacity-60 group-hover:opacity-100 transition-opacity duration-150",
                    )}>
                    {entry.data.title}
                </a>
            </article>
        );
    },
);

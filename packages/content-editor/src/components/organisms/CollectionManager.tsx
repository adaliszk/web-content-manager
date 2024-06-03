import type { ULIDLike } from "@adaliszk/std";
import { type PropsOf, Resource, component$, useResource$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import { AppData, routeTo } from "~/app/context.ts";
import type { CollectionReference, CollectionType } from "~/app/types.ts";
import { Collapse, CollectionManagerEntry, Select } from "~/components.ts";
import { Icon } from "~/icons.tsx";

export type CollectionDefinitionProps = PropsOf<"section"> & {
    variant: CollectionType;
    reference: CollectionReference;
    indexNames?: string[];
};

export type CollectionEntryItem = {
    id: ULIDLike;
    createdAt: Date;
    updatedAt: Date;
    data: {
        title: string;
    };
};

export const CollectionManager = component$<CollectionDefinitionProps>(
    ({ variant, reference, indexNames, class: classList, ...props }) => {
        return (
            <Resource
                value={useResource$(async ({ track }) => {
                    track(() => reference);

                    const { id, name, format } = (await AppData.getCollection(reference)).unwrap();
                    const entries: CollectionEntryItem[] = [];

                    for await (const entry of AppData.getEntries(reference)) {
                        if (entry.isOk()) {
                            const { id, createdAt, updatedAt, data } = entry.unwrap();
                            entries.push({
                                id,
                                createdAt,
                                updatedAt,
                                data,
                            } satisfies CollectionEntryItem);
                        }
                    }

                    return { collection: { id: id.toString(), name, format }, entries };
                })}
                onPending={() => <p>Loading...</p>}
                onResolved={({ collection, entries }) => (
                    <Collapse
                        {...props}
                        class={twMerge("ml-2", classList?.toString())}
                        group={`collection-${collection.id}`}
                        value={collection.id.toString()}
                        mode={"toggle"}>
                        <span
                            q:slot={"header"}
                            class={twMerge(
                                "inline-block pr-2 relative -top-0.5",
                                "opacity-80 dark:opacity-60 group-hover:opacity-100 transition-opacity duration-150",
                            )}>
                            <Icon name={"folder"} size={18} />
                        </span>
                        <span
                            q:slot={"header"}
                            class={twMerge(
                                "inline-block flex-grow",
                                "opacity-80 dark:opacity-60 group-hover:opacity-100 transition-opacity duration-150",
                            )}>
                            {collection.name}
                        </span>
                        {indexNames && (
                            <Select
                                q:slot={"header"}
                                name={"indexBy"}
                                class={
                                    "w-28 text-right select-ghost disabled:bg-transparent disabled:border-transparent"
                                }
                                value={""}
                                disabled>
                                <option value={""}>default</option>
                                {indexNames.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </Select>
                        )}
                        <a
                            q:slot={"header"}
                            href={routeTo.openEntry(variant, "new")}
                            class={twMerge(
                                "p-1.5 bg-transparent border border-transparent rounded",
                                "opacity-5 group-hover:opacity-100 transition-opacity duration-150",
                            )}>
                            <Icon name={"file-plus"} size={18} />
                        </a>
                        <a
                            q:slot={"header"}
                            href={routeTo.openEntry(variant, collection.id)}
                            class={twMerge(
                                "p-1.5 bg-transparent border border-transparent rounded",
                                "opacity-5 group-hover:opacity-100 transition-opacity duration-150",
                            )}>
                            <Icon name={"pencil"} size={18} />
                        </a>

                        <div class={"pl-4 -mr-2 border-l"}>
                            {entries.map((entry) => (
                                <CollectionManagerEntry
                                    key={entry.id.toString()}
                                    collection={collection.id}
                                    entry={entry}
                                    variant={variant}
                                />
                            ))}
                        </div>
                    </Collapse>
                )}
                onRejected={(error) => {
                    console.error("Failed to load:", error);
                    return <pre>Failed to load: {error.message}</pre>;
                }}
            />
        );
    },
);

import Astro from "astro:global";
import { type Result, type ULIDLike, createULIDLike } from "@adaliszk/std";
import { AppData } from "~/app/context.ts";
import {
    type CollectionEntry,
    CollectionParam,
    type CollectionType,
    type ParsedCollectionDefinition,
} from "~/app/types.ts";
import type { IconName } from "~/icons.tsx";

export type EditorTab = {
    variant: CollectionType | "static";
    icon: IconName;
    parent?: Result<ParsedCollectionDefinition, Error>;
    item?: Result<ParsedCollectionDefinition | CollectionEntry, Error>;
    action?: "new" | "edit" | "delete";
    collectionId?: ULIDLike;
    entryId?: ULIDLike;
};

const variantIcon: Record<CollectionType, IconName> = {
    file: "file",
    db: "database",
};

export async function* resolveEditorTabs(): AsyncGenerator<EditorTab> {
    const tabs = Astro.url.searchParams.getAll("e") ?? [];
    for await (const encoded of tabs) {
        // The parameter is constructed as:
        // 2-char variant type
        // 26-char ULID of Collection ID or "new" but only when Entry ID is empty
        // 26 char ULID of Entry ID or "new"
        const variant = encoded.substring(0, 2) as CollectionType;
        const searchParam = encoded.substring(2, encoded.length).replace("undefined", "");
        const ids = Array.from(searchParam.matchAll(/\w{0,26}/gi));
        const [collectionStr] = ids[0] as ["new" | string | undefined];
        const [entryStr] = ids[1] as ["new" | string | undefined];

        if (collectionStr === "new" || collectionStr === undefined) {
            yield {
                icon: variantIcon[variant],
                variant,
                action: collectionStr ?? "edit",
            };
            continue;
        }

        const collectionId = createULIDLike(collectionStr).unwrap();
        const collection = await AppData.getCollection(collectionId);

        if (entryStr === "new" || entryStr === undefined) {
            yield {
                icon: variantIcon[variant],
                variant,
                item: collection,
                action: entryStr ?? "edit",
                collectionId,
            };
            continue;
        }

        const entryId = createULIDLike(entryStr).unwrap();
        const entry = await AppData.getEntry(collectionId, entryId);

        yield {
            icon: "file",
            variant,
            parent: collection,
            item: entry,
            action: "edit",
            collectionId,
            entryId,
        };
    }
}

/**
 * Opens an entry to the editor pane
 */
function openEntry(variant: CollectionType, collectionId: ULIDLike | "new"): string;
function openEntry(
    variant: CollectionType,
    collectionId: ULIDLike,
    entryId: ULIDLike | "new",
): string;
function openEntry(
    variant: CollectionType,
    collectionId: ULIDLike | "new",
    entryId?: ULIDLike | "new",
): string {
    const query = new URLSearchParams(Astro.url.searchParams);
    const variantCode = CollectionParam[variant];
    const tabs = new Set(Astro.url.searchParams.getAll("e") ?? []);
    tabs.add(`${variantCode}${collectionId}${entryId}`);
    query.delete("e");
    for (const tab of tabs) {
        query.append("e", tab);
    }
    return `?${query.toString()}`;
}

/**
 * Closes an entry to the editor pane
 */
function closeEntry(variant: CollectionType, collectionId: ULIDLike | "new"): string;
function closeEntry(
    variant: CollectionType,
    collectionId: ULIDLike,
    entryId: ULIDLike | "new",
): string;
function closeEntry(
    variant: CollectionType,
    collectionId: ULIDLike | "new",
    entryId?: ULIDLike | "new",
): string {
    const query = new URLSearchParams(Astro.url.searchParams);
    const variantCode = CollectionParam[variant];
    const tabs = new Set(Astro.url.searchParams.getAll("e") ?? []);
    tabs.delete(`${variantCode}${collectionId}${entryId}`);
    query.delete("e");
    for (const tab of tabs) {
        query.append("e", tab);
    }
    return `?${query.toString()}`;
}

function switchTab(index: number) {
    const query = new URLSearchParams(Astro.url.searchParams);
    query.set("t", index.toString());
    return `?${query.toString()}`;
}

export const routeTo = {
    openEntry,
    closeEntry,
    switchTab,
};

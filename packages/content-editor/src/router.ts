import Astro from "astro:global";
import { type Result, type ULIDLike, createULIDLike } from "@adaliszk/std";
import { AppData } from "~/app/context.ts";
import {
    type CollectionEntry,
    CollectionParam,
    type CollectionType,
    type IconName,
    type ParsedCollectionDefinition,
} from "~/app/types.ts";

export type PageName = "dashboard" | "collection" | "entry";

export type EditorVariants = CollectionType | "static";
export type CollectionResult = Result<ParsedCollectionDefinition, Error>;
export type EntryResult = Result<CollectionEntry, Error>;

export type EditorTab<ITEM extends CollectionResult | EntryResult = CollectionResult> = {
    variant: EditorVariants;
    icon: IconName;
    page: PageName;
    parent?: CollectionResult;
    item?: ITEM;
    action?: "new" | "edit" | "delete";
    collectionId?: ULIDLike;
    entryId?: ULIDLike;
};

const variantIcon: Record<CollectionType, IconName> = {
    file: "file",
    db: "database",
};

export async function resolvePathReference<
    ITEM extends CollectionResult | EntryResult = CollectionResult | EntryResult,
>(encoded: string): Promise<EditorTab<ITEM>> {
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
        return {
            icon: variantIcon[variant],
            action: collectionStr ?? "edit",
            page: "collection",
            variant,
        };
    }

    const collectionId = createULIDLike(collectionStr).unwrap();
    const collection = await AppData.getCollection(collectionId);

    if (entryStr === "new" || entryStr === undefined) {
        return {
            icon: variantIcon[variant],
            page: "entry",
            variant,
            parent: collection,
            item: collection,
            action: entryStr ?? "edit",
            collectionId,
        } as EditorTab<ITEM>;
    }

    const entryId = createULIDLike(entryStr).unwrap();
    const entry = await AppData.getEntry(collectionId, entryId);

    return {
        icon: "file",
        page: "entry",
        variant,
        parent: collection,
        item: entry,
        action: "edit",
        collectionId,
        entryId,
    } as EditorTab<ITEM>;
}

export async function* resolveEditorTabs(ref?: string): AsyncGenerator<EditorTab> {
    const tabs = [Astro.url.searchParams.getAll("e") ?? [], ref].flat().filter(Boolean);
    console.log("tabs", { tabs, ref });
    for await (const encoded of tabs) {
        yield await resolvePathReference(encoded);
    }
}

/**
 * Opens an entry to the editor pane
 */
function openTab(variant: CollectionType, collectionId: ULIDLike | "new"): string;
function openTab(
    variant: CollectionType,
    collectionId: ULIDLike,
    entryId: ULIDLike | "new",
): string;
function openTab(
    variant: CollectionType,
    collectionId: ULIDLike | "new",
    entryId?: ULIDLike | "new",
): string {
    const variantCode = CollectionParam[variant];

    // ! TODO: Handle multiple tabs in the same page
    // const query = new URLSearchParams(Astro.url.searchParams);
    // const tabs = new Set(Astro.url.searchParams.getAll("e") ?? []);
    // tabs.add(`${variantCode}${collectionId}${entryId}`);
    // for (const tab of tabs) {
    //    query.append("e", tab);
    // }

    const page: PageName = entryId ? "entry" : "collection";
    return `/${page}/${variantCode}${collectionId}${entryId}`;
}

/**
 * Closes an entry to the editor pane
 */
function closeTab(variant: CollectionType, collectionId: ULIDLike | "new"): string;
function closeTab(
    variant: CollectionType,
    collectionId: ULIDLike,
    entryId: ULIDLike | "new",
): string;
function closeTab(
    _variant: CollectionType,
    _collectionId: ULIDLike | "new",
    _entryId?: ULIDLike | "new",
): string {
    // ! TODO: Handle multiple tabs in the same page
    // const query = new URLSearchParams(Astro.url.searchParams);
    // const variantCode = CollectionParam[variant];
    // const tabs = new Set(Astro.url.searchParams.getAll("e") ?? []);
    // tabs.delete(`${variantCode}${collectionId}${entryId}`);
    // query.delete("e");
    // for (const tab of tabs) {
    //     query.append("e", tab);
    // }
    return "/dashboard";
}

/**
 * Switches to a different page that controls the selected tab
 */
function switchPage(name: PageName) {
    const query = new URLSearchParams(Astro.url.searchParams);
    const queryString = query.toString();
    return `/${name}${queryString && `?${queryString}`}`;
}

export const routeTo = {
    openTab,
    closeTab,
    switchPage,
};

import type { AstroVNode } from "astro/jsx-runtime";
import { z } from "zod";

export { ParsedCollectionDefinition, CollectionEntry } from "@adaliszk/content-manager";
export * from "./data/types.ts";

export type AstroJSXNode = AstroVNode & {
    props: { children?: (AstroJSXNode | string)[] | (AstroJSXNode | string) };
};
export type { AstroVNode };

const s2 = z.string().length(2);

export const CollectionVariant = ["file", "db"] as const;
export type CollectionType = (typeof CollectionVariant)[number];
export const CollectionParam: Record<CollectionType, z.infer<typeof s2>> = {
    file: s2.parse("fs"),
    db: s2.parse("db"),
};

const icons = [
    "chevron-up",
    "chevron-down",
    "chevron-left",
    "chevron-right",
    "comment",
    "comment-text",
    "duplicate",
    "pencil",
    "trash",
    "link",
    "home",
    "plus",
    "minus",
    "database",
    "dots-horizontal",
    "dots-vertical",
    "file",
    "file-edit",
    "file-lock",
    "file-lock-open",
    "file-compare",
    "file-check",
    "file-clock",
    "file-plus",
    "file-redirect",
    "file-eye-outline",
    "folder",
    "folder-open",
    "folder-edit",
    "folder-home",
    "folder-lock",
    "folder-lockOpen",
    "folder-plus",
    "settings",
    "format-pilcrow",
    "format-quote-open",
    "format-quote-close",
    "format-header",
    "format-list-bulleted",
    "format-list-numbered",
    "format-image",
    "format-image-transparent",
    "format-table",
    "format-code",
    "format-header1",
    "format-header2",
    "format-header3",
    "format-header4",
    "format-header5",
    "format-header6",
] as const;

export type IconName = (typeof icons)[number];

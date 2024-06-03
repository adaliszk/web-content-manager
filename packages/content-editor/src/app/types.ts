import { z } from "zod";

export { ParsedCollectionDefinition, CollectionEntry } from "@adaliszk/content-manager";
export * from "./data/types.ts";

const s2 = z.string().length(2);

export const CollectionVariant = ["file", "db"] as const;
export type CollectionType = (typeof CollectionVariant)[number];
export const CollectionParam: Record<CollectionType, z.infer<typeof s2>> = {
    file: s2.parse("fs"),
    db: s2.parse("db"),
};

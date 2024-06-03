import type { CollectionEntry, LatestChanges } from "../../core/index.js";
import type { MarkdownImport } from "./types.js";

type ImportDefinition = MarkdownImport & Partial<LatestChanges>;

/**
 * Lightweight import mapper to enrich types automatically
 * Only intended to be used internally!
 */
export function importMarkdownFiles<KEYS extends string, ENTRY extends CollectionEntry>(
    imports: Record<KEYS, ImportDefinition>,
): Map<KEYS, ENTRY> {
    const map = new Map();
    const entries = Object.entries<ImportDefinition>(imports);
    for (const [key, { frontmatter: data, default: Content, ...fields }] of entries) {
        map.set(key, {
            ...fields,
            Content,
            data,
        });
    }
    return map;
}

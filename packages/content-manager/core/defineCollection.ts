import type { ULIDLike } from "@adaliszk/std";
import type { ZodSchema, z } from "zod";
import type { RegExpression } from "./regexp.js";

import { basename } from "node:path";
import { capitalize, pluralize } from "inflection";
import { ObjectType, md5, uid } from "../internal/index.js";

type FileExtension = "md" | "mdx" | "json" | "yaml";

/**
 * Exposes the GIT history for the particular file in question.
 */
export type LatestChanges = {
    updatedAt: Date;
    updatedBy: { name: string; email: string };
    updateMessage: string;
    updateCommit: string;
};

/**
 * Possible path properties that you can specify in the "content" pattern
 */
export type PathProps = {
    name?: string;
    sortIndex?: number;
    langCode?: string;
};

/**
 * Exposes the imported file contents with its data for consumption, as well as adds a few metadata fields
 * that can get handy for managing contents.
 */
export type CollectionEntry<SCHEMA = unknown> = PathProps &
    Partial<LatestChanges> & {
        id: string;
        path: string;
        file: `${string}.${FileExtension}`;
        ext: FileExtension;
        data: SCHEMA;
        Content: () => string;
        createdAt: Date;
        updatedAt: Date;
    };

/**
 * Defines an index using the available data from the files
 *
 * You can define two methods:
 * `partition(data)`: what partition groups exist based on the frontmatter data
 * `sort(a, b)`: how should the items be ordered within the index partitions
 *
 * You need to specify at least one of the indexing methods!
 *
 * If you do not define a partition method, the index will contain all entries but with your desired sorting order.
 *
 * If you do not define a sorting method, the order will be done by the ID, which is the filename by default.
 */
export type CollectionIndex<
    SCHEMA extends ZodSchema,
    ENTRY = Omit<CollectionEntry<z.infer<SCHEMA>>, "Content">,
> =
    | {
          partition: (data: ENTRY) => string | undefined;
          sort?: (a: ENTRY, b: ENTRY) => typeof NaN | number;
      }
    | {
          partition?: (data: ENTRY) => string | undefined;
          sort: (a: ENTRY, b: ENTRY) => typeof NaN | number;
      };

/**
 * Guides the definition of collections by giving it a shape, and exposes hooks into the indexing process.
 */
export type CollectionDefinition<
    SCHEMA extends ZodSchema,
    INDEX = CollectionIndex<SCHEMA>,
    ENTRY = CollectionEntry<z.infer<SCHEMA>>,
> = {
    /**
     * Custom name for display purposes.
     */
    name?: string;

    /**
     * The type of collection, allowing various technologies to be used as the datasource.
     */
    format: "markdown" | "json" | "yaml";

    /**
     * Regex matcher for the collection files and mapping fields within the path:
     * ```javascript
     * import { r, root, name } from "@adaliszk/content-manager";
     *
     * const content = r`${root("collection")}/${name(r`[a-z0-9_-]+`)}.mdx?`;
     * ```
     */
    content: RegExpression;

    /**
     * The zod definition for the frontmatter data
     * This will be used to validate them and throw errors in the console!
     */
    schema: SCHEMA;

    /**
     * Option to declare additional exports with a different indexing algorithm.
     * This is useful when you have various content types that you often access with a fixed filter.
     */
    index?: Record<string, INDEX>;

    /**
     * Defines the default sorting algorithm for the "collection" exports.
     * By default, it will order by ID, which is the filename.
     */
    sort?: (a: ENTRY, b: ENTRY) => typeof NaN | number;
};

/**
 * Instrumented collection definition for easy export filtering.
 */
export type ParsedCollectionDefinition<SCHEMA extends ZodSchema = ZodSchema> =
    CollectionDefinition<SCHEMA> & {
        __type: ObjectType.CollectionDefinition;
        id: ULIDLike;
        name: Capitalize<string> | string;
        exportName: string;
        rootDir: string;
    };

/**
 * Create a collection definition for your content.
 * For now, it does essentially nothing but in the future it may enrich the provided configuration!
 */
export function defineCollection<SCHEMA extends ZodSchema>(
    definition: CollectionDefinition<SCHEMA>,
): ParsedCollectionDefinition<SCHEMA> {
    const [rootPattern, _contentPattern] = definition.content.pattern.split("//");
    const rootDir = rootPattern.replace(/\W+/g, "");
    if (rootDir === "") {
        throw new Error(
            [
                `The content pattern must start with the root path, started with: "${rootDir}"`,
                "Please use the root directive at the start of the content pattern: r`${root('collection')}/${any()}.mdx?`",
            ].join("\n"),
        );
    }
    return {
        __type: ObjectType.CollectionDefinition,
        ...definition,
        name: capitalize(definition?.name ?? basename(rootDir)) as Capitalize<string>,
        id: uid(md5(rootDir)),
        exportName: pluralize(rootDir),
        rootDir,
    };
}

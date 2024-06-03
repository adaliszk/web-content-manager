import type { CollectionEntry, ParsedCollectionDefinition } from "@adaliszk/content-manager";
import type { Result } from "@adaliszk/std";
import type { ZodSchema } from "zod";

export type CollectionReference = string;
export type EntryReference = string;

export type { CollectionEntry };

export type DataSource = {
    getCollections(): Promise<Result<ParsedCollectionDefinition[], Error>>;
    getCollection<SCHEMA extends ZodSchema>(
        collection: CollectionReference,
    ): Promise<Result<ParsedCollectionDefinition<SCHEMA>, Error>>;

    getEntries<SCHEMA extends ZodSchema>(
        collection: CollectionReference,
    ): AsyncGenerator<Result<CollectionEntry<SCHEMA>, Error>>;
    getEntry<SCHEMA extends ZodSchema>(
        collection: CollectionReference,
        entry: EntryReference,
    ): Promise<Result<CollectionEntry<SCHEMA>, Error>>;
};

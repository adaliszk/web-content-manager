import type { CollectionEntry, ParsedCollectionDefinition } from "@adaliszk/content-manager";
import type { CollectionReference, DataSource, EntryReference } from "./types.ts";

import { resolve } from "node:path";
import { cwd } from "node:process";
import { type Result, createErr, createOk } from "@adaliszk/std";
import { Logger } from "~/app/logger.js";

/**
 * Exposes data manipulation and access methods for filesystem collections
 */
export class FileDataProvider implements DataSource {
    private readonly collectionMap: Map<string, ParsedCollectionDefinition>;

    constructor(
        /** Collection Configuration files relative to the rootPath */
        private readonly collectionsDefinitions: ParsedCollectionDefinition[],
        /** The path where the collections are normally located */
        private readonly contentPath: string = cwd(),
        private readonly log = Logger.child({ service: FileDataProvider.name }),
    ) {
        this.collectionMap = new Map<string, ParsedCollectionDefinition>(
            collectionsDefinitions.map((definition) => [`${definition.id}`, definition]),
        );
    }

    async getCollections(): Promise<Result<ParsedCollectionDefinition[], Error>> {
        return createOk(this.collectionsDefinitions);
    }

    async getCollection(
        collectionRef: CollectionReference,
    ): Promise<Result<ParsedCollectionDefinition, Error>> {
        const collection = this.collectionMap.get(`${collectionRef}`);
        if (!collection) {
            return createErr(new Error("Could not find the requested Collection!"));
        }

        return createOk(collection as ParsedCollectionDefinition);
    }

    async *getEntries(
        collectionRef: CollectionReference,
    ): AsyncGenerator<Result<CollectionEntry, Error>> {
        const indexEntries = (await this.importCollectionIndex(collectionRef)).unwrap();
        if (!indexEntries || indexEntries.size === 0) {
            this.log.error({ collectionRef, indexEntries }, "There are no entries to retrieve!");
            return createErr(
                new Error(`There are no entries to retrieve for "Collection#${collectionRef}"!`),
            );
        }

        for (const [_id, entry] of indexEntries) {
            yield createOk(entry);
        }
    }

    async getEntry(
        collectionRef: CollectionReference,
        entryRef: EntryReference,
    ): Promise<Result<CollectionEntry, Error>> {
        const collection = (await this.importCollectionIndex(collectionRef.toString())).unwrapOr(
            undefined,
        );
        if (!collection) {
            return createErr(new Error("Could not find the requested Collection!"));
        }

        const entry = collection.get(entryRef.toString());
        if (!entry) {
            return createErr(new Error("Could not find the requested Entry!"));
        }

        return createOk(entry);
    }

    private get rootPath(): string {
        return this.contentPath;
    }

    private async importCollectionIndex(
        collection: CollectionReference,
    ): Promise<Result<Map<EntryReference, CollectionEntry>, Error>> {
        const definition = this.collectionMap.get(`${collection}`);
        if (!definition) {
            return createErr(
                new Error(
                    "The provided reference has not been declared for this instance of the data provider!",
                ),
            );
        }

        const indexFile = resolve(this.rootPath, definition.rootDir, "index.ts");
        const index = await import(/* @vite-ignore */ indexFile);
        this.log.debug({ indexFile, exports: Object.keys(index) }, "Collection index imported");
        const indexEntries = index._byId as Map<EntryReference, CollectionEntry>;

        return createOk(indexEntries);
    }
}

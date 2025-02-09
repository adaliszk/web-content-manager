import type { Result } from "@adaliszk/std";
import type { ZodSchema } from "zod";
import type {
    CollectionEntry,
    LatestChanges,
    MinimalCollectionEntry,
    ParsedCollectionDefinition,
    RegExpression,
} from "../../core/index.ts";

import { existsSync } from "node:fs";
import { readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { createErr, createOk } from "@adaliszk/std";
import { pascalCase } from "change-case";
import { singularize } from "inflection";
import { simpleGit } from "simple-git";
import { createTypeAlias, printNode, zodToTs } from "zod-to-ts";

import { PLUGIN_NAME } from "../constants.js";
import { md5, uid } from "../utils.js";
import { parseFrontmatter } from "./parseFrontmatter.js";

const extMatch = /\.mdx?$/;

type MarkdownIndexGeneratorArgs<SCHEMA extends ZodSchema> = {
    definition: ParsedCollectionDefinition<SCHEMA>;
    basePath: string;
};

export async function generateMarkdownIndex<SCHEMA extends ZodSchema>({
    definition: { schema, content, index, exportName },
    basePath,
}: MarkdownIndexGeneratorArgs<SCHEMA>): Promise<string> {
    const [rootPattern, _] = content.pattern.split("//");
    const scanDir = rootPattern.replace(/\W+/g, "");
    const scanPath = resolve(basePath, scanDir);

    const indexFile = resolve(scanPath, "index.ts");
    const indexContent = ["// Autogenerated file, please do not modify this manually!"];
    const fileEntries = resolveEntries({
        basePath,
        scanPath,
        content,
    });

    const returnResult = async () => {
        await writeFile(indexFile, `${indexContent.join("\n")}\n`, { encoding: "utf-8" });
        return indexFile;
    };

    type CollectionData = Omit<CollectionEntry<SCHEMA & MinimalCollectionEntry>, "Content">;

    const map = new Map<string, CollectionData>();
    for await (const { fileName, props } of fileEntries) {
        const file = fileName.replace(`${scanPath}/`, "") as `${string}.${"md" | "mdx"}`;
        const path = dirname(fileName.replace(`${scanPath}/`, ""));
        const stats = await stat(fileName);
        const changes = (await fetchHistory(basePath, fileName)).unwrapOr(undefined);
        map.set(props?.name !== undefined ? join(path, props?.name) : file.replace(extMatch, ""), {
            file,
            path,
            id: uid(md5(file)),
            name: props.name ?? basename(fileName, extname(fileName)),
            ext: extname(fileName).replace(".", "") as "md" | "mdx",
            data: (await parseFrontmatter({ fileName, schema })).unwrap(),
            createdAt: stats.birthtime,
            updatedAt: changes?.updatedAt ?? stats.ctime,
            updatedBy: changes?.updatedBy,
            updateMessage: changes?.updateMessage,
            updateCommit: changes?.updateCommit,
            sortIndex: Number.parseInt(props?.sortIndex ?? "0"),
            langCode: props.langCode,
        });
    }

    if (map.size === 0) return await returnResult();

    const collectionName = singularize(pascalCase(exportName));
    const keyType = `${collectionName}Keys` as const;
    const schemaType = `${collectionName}Schema` as const;
    const entryType = `${collectionName}Entry` as const;

    const entryList = Array.from(map.entries());
    const entries = entryList.map(([key, entry]) =>
        [
            `"${key}": {`,
            `    ...(await import("./${entry.file}")),`,
            `    id: "${entry.id}",`,
            `    name: ${JSON.stringify(entry.name)},`,
            `    path: ${JSON.stringify(entry.path)},`,
            `    file: ${JSON.stringify(entry.file)},`,
            `    ext: ${JSON.stringify(entry.ext)},`,
            `    langCode: ${JSON.stringify(entry.langCode)},`,
            `    sortIndex: ${JSON.stringify(entry.sortIndex)},`,
            `    createdAt: new Date("${entry.createdAt.toISOString()}"),`,
            `    updatedAt: new Date("${entry.updatedAt.toISOString()}"),`,
            `    updatedBy: ${JSON.stringify(entry.updatedBy)},`,
            `    updateMessage: "${entry.updateMessage}",`,
            `    updateCommit: "${entry.updateCommit}",`,
            "},",
        ].join("\n"),
    );

    indexContent.push(
        ...[
            "\n",
            `import { type CollectionEntry, importMarkdownFiles } from "${PLUGIN_NAME}/internal"`,
            "\n",
            `export type ${keyType} = ${Array.from(map.keys())
                .map((key) => `"${key}"`)
                .join(" | ")};`,
            "\n",
            `export ${printNode(createTypeAlias(zodToTs(schema).node, schemaType))}`,
            "\n",
            `export type ${entryType} = CollectionEntry< ${schemaType} >;`,
            "\n",
            `export const ${exportName} = importMarkdownFiles< ${keyType}, ${entryType} >({`,
            ...entries.flat(),
            "});",
        ],
    );

    indexContent.push(
        ...[
            "\n",
            `export const _byId = new Map< string, ${entryType} >(`,
            `    Array.from(${exportName}.values()).map((entry: ${entryType}) =>`,
            "        [entry.id, entry],",
            "    )",
            ");",
        ],
    );

    if (!index) return await returnResult();

    for await (const [indexName, indexDef] of Object.entries(index)) {
        const partitions = new Map<string, string[]>();

        for (const [key, entry] of map) {
            const partitionKey = indexDef.partition?.(entry);
            if (!partitionKey) continue;
            if (!partitions.has(partitionKey)) partitions.set(partitionKey, []);
            partitions.get(partitionKey)?.push(`${exportName}.get("${key}")`);
        }

        const exportKeys = `${pascalCase(indexName)}Keys` as const;
        indexContent.push(
            ...[
                "\n",
                `export type ${exportKeys} = ${Array.from(partitions.keys())
                    .map((value) => `"${value}"`)
                    .join(" | ")}`,
                "\n",
                `export const ${indexName} = new Map< ${exportKeys}, ${entryType}[] >([`,
                ...Array.from(partitions.entries()).map(
                    ([group, entries]) =>
                        `    ["${group}", [${entries.join(", ")}] as ${entryType}[]],`,
                ),
                "])",
            ],
        );
    }

    return await returnResult();
}

async function* resolveEntries({
    scanPath,
    basePath,
    content,
}: {
    scanPath: string;
    basePath: string;
    content: RegExpression;
}) {
    const files = await readdir(scanPath, { recursive: true });
    for (const file of files) {
        if (file.match(extMatch) === null) continue; // Skipp all non-markdown files
        const fileName = resolve(scanPath, file);
        const fileRef = fileName.replace(`${basePath}/`, "");
        const matches = fileRef.match(content.regexp);
        if (matches === null) continue;
        yield {
            fileName: fileName as `${string}.${"md" | "mdx"}`,
            props: (matches?.groups ?? {}) as {
                sortIndex?: string;
                langCode?: string;
                name?: string;
            },
        };
    }
}

function findGitFolder(path: string) {
    const candidate = resolve(path, ".git");
    if (!existsSync(candidate)) return findGitFolder(dirname(path));
    return candidate;
}

async function fetchHistory(
    basePath: string,
    fileName: string,
): Promise<Result<LatestChanges | undefined, Error>> {
    try {
        const gitPath = findGitFolder(basePath);
        const git = simpleGit(gitPath);
        const file = fileName.replace(`${dirname(gitPath)}/`, "");
        const log = await git.log({ file });
        if (!log.latest) {
            return createErr(new Error("The file is not tracked by git!"));
        }
        return createOk({
            updatedAt: new Date(log.latest.date),
            updatedBy: {
                email: log.latest.author_email,
                name: log.latest.author_name,
            },
            updateMessage: log.latest.message,
            updateCommit: log.latest.hash,
        });
    } catch (err) {
        return createErr(err as Error);
    }
}

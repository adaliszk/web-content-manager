import type { Result } from "@adaliszk/std";
import type { YAMLException } from "js-yaml";
import type { ZodError, ZodSchema, z } from "zod";

import { createReadStream } from "node:fs";
import { createInterface as createLineReader } from "node:readline";
import { createErr, createOk } from "@adaliszk/std";
import { load as parseYaml } from "js-yaml";

type FrontmatterParserArgs<SCHEMA extends ZodSchema> = {
    fileName: `${string}.${"md" | "mdx"}`;
    schema: SCHEMA;
};

/**
 * Parses the frontmatter contents with the provided Zod schema.
 */
export async function parseFrontmatter<SCHEMA extends ZodSchema>({
    fileName,
    schema,
}: FrontmatterParserArgs<SCHEMA>): Promise<
    Result<z.infer<SCHEMA>, YAMLException | ZodError | Error>
> {
    try {
        const frontmatter = await extractFrontmatter(fileName);
        const data = parseYaml(frontmatter);
        return createOk(schema.parse(data));
    } catch (err) {
        return createErr(err as YAMLException | ZodError | Error);
    }
}

async function extractFrontmatter(fileName: `${string}.${"md" | "mdx"}`): Promise<string> {
    const fileStream = createReadStream(fileName, { encoding: "utf-8" });
    const lines = createLineReader({
        crlfDelay: Number.POSITIVE_INFINITY, // Combines \r\n no matter how quickly they follow each other
        input: fileStream,
    });

    let frontmatter = "";
    let headCount = 0;

    for await (const line of lines) {
        if (line.trim() === "---") headCount++;
        if (headCount >= 2) break;
        frontmatter += `${line}\n`;
    }

    return frontmatter;
}

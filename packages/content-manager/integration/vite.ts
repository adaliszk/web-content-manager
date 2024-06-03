import type { CompilerOptions } from "typescript";
import type { Plugin, ResolvedConfig } from "vite";

import { createHash } from "node:crypto";
import { constants, access, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { cwd, stdout } from "node:process";

import chalk from "chalk";
import { createLogger, transformWithEsbuild } from "vite";

import type { ParsedCollectionDefinition } from "../core/index.js";
import {
    ObjectType,
    PLUGIN_NAME,
    PLUGIN_VERSION,
    generateMarkdownIndex,
} from "../internal/index.ts";

/**
 * File path to the configuration file that contains the collection definitions, relative from the vite config.
 *
 * ```typescript
 * "file://content/collections.ts"
 * ```
 */
export type FileCollectionConfig = `file://${string}.${"ts" | "mts" | "js" | "mjs"}`;

/**
 * Configures how the Vite plugin behaves and uses for parsing data.
 */
export type ImportContentOptions = {
    /**
     * List of collection definition files that exports definitions for parsing.
     */
    collections: FileCollectionConfig[];

    /**
     * Allow you to format the generated files with your own tooling of choice.
     */
    formatCmd?: (file: string) => Promise<void> | void;
};

/**
 * API for interacting with the plugin once retrieved from the plugins' list
 */
export type ImportContentApi = {
    options: ImportContentOptions;
};

/**
 * Parse and Generate Content Imports using already declared loaders.
 *
 * For example:
 * ```typescript
 * // ./vite.config.ts
 * import { defineConfig } from "vite";
 * import { importContent } from "@adaliszk/web-content-manager/vite";
 * import parseMarkdown from "vite-plugin-remark-rehype";
 *
 * export default defineConfig({
 *     plugins: [
 *         parseMarkdown(),
 *         importContent({
 *             collections: [
 *                 "file://contents/collections.ts",
 *             ],
 *         }),
 *     ],
 * });
 * ```
 */
export async function importContent(
    options: ImportContentOptions,
): Promise<Plugin<ImportContentApi>> {
    let config: ResolvedConfig;
    return {
        enforce: "pre",
        name: PLUGIN_NAME,
        version: PLUGIN_VERSION,
        api: {
            options,
        },
        async configResolved(resolvedConfig) {
            config = resolvedConfig;
            await checkTypescriptConfig(options, config);
        },
        async buildStart() {
            await compileContentIndexes(options, config);
        },
    };
}

const log = createLogger();
const md5 = createHash("md5");

/**
 * @throws Error when tsconfig.json does not exist or cannot be read
 * @throws SyntaxError when the tsconfig.json does not contain a valid JSON
 */
async function checkTypescriptConfig(options: ImportContentOptions, config: ResolvedConfig) {
    const importPaths = options.collections.map((configFile) =>
        dirname(configFile.replace("file://", "")),
    );

    // Resolve typescript config file
    const tsConfigPath = resolve(config?.root ?? cwd(), "tsconfig.json");
    await access(tsConfigPath, constants.R_OK);
    const tsConfig = JSON.parse(await readFile(tsConfigPath, { encoding: "utf-8" })) as {
        compilerOptions?: CompilerOptions;
    };

    // Resolve typescript paths
    const baseUrl = tsConfig?.compilerOptions?.baseUrl ?? "";
    const compilerPaths = Object.values(tsConfig?.compilerOptions?.paths ?? {}).flat();

    // Calculate relative path from the basePath
    const pathPrefix = join(
        // Matching path segments will tell the dept no matter if the Url starts or ends with slashes
        ...Array.from(baseUrl.matchAll(/[a-z-_ ]+/gi)).map(() => ".."),
    );

    // Check for Import Path and warn about missing import patterns
    // TODO: Add interactive mode, where upon missing a pattern, offer to automatically
    for (const path of importPaths) {
        const importPattern = join(pathPrefix, path, "*");
        const declared = compilerPaths.includes(importPattern);
        if (declared) continue;
        // otherwise
        log.warn(
            chalk.yellow(
                `  Import pattern "${importPattern}" is not declared in your typescript config's compilerOptions.paths!\n`,
                " While the content import generation will work, you have no way to use them!",
            ),
        );
    }
}

async function compileContentIndexes(
    options: ImportContentOptions,
    config: ResolvedConfig,
): Promise<void> {
    for await (const collection of options.collections) {
        const cachePath = config?.cacheDir ?? resolve(cwd(), "node_modules", ".vite");
        const filePath = resolve(config?.root ?? cwd(), collection.replace("file://", ""));
        const compiledPath = await transformTypescript(cachePath, filePath);

        const definitions = await import(/* @vite-ignore */ compiledPath).then((exports) =>
            Object.entries<ParsedCollectionDefinition>(exports).filter(
                ([_name, object]) => object?.__type === ObjectType.CollectionDefinition,
            ),
        );

        for await (const [name, definition] of definitions) {
            stdout.write(
                chalk.grey(`  Compiling "${definition?.exportName ?? name}" collection...`),
            );

            const startMarker = performance.now();
            const importFile = await generateMarkdownIndex({
                basePath: dirname(filePath),
                definition,
            });
            const endMarker = performance.now();
            const elapsed = (endMarker - startMarker).toFixed(2);

            if (options.formatCmd) await options.formatCmd(importFile);

            stdout.write(chalk.grey(` done in ${elapsed}ms\n`));
        }
    }
}

async function transformTypescript(cachePath: string, fileName: string): Promise<string> {
    const code = await readFile(resolve(fileName), { encoding: "utf-8" });
    const transformed = await transformWithEsbuild(code, fileName);
    const tmpFile = resolve(cachePath, `${md5.update(fileName).digest("hex")}.mjs`);
    await writeFile(tmpFile, transformed.code);
    return tmpFile;
}

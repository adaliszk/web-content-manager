import type { UserConfig } from "vite";

import { execSync } from "node:child_process";
import { cwd } from "node:process";
import { importContent } from "@adaliszk/content-manager/vite";
import { webConfig } from "@adaliszk/web-compiler";

// noinspection JSUnusedGlobalSymbols
export default webConfig({
    https: true,
    plugins: [
        importContent({
            collections: ["file://content/collections.ts"],
            formatCmd: (file) => {
                execSync(`biome format --write ${file}`, { cwd: cwd() });
            },
        }),
    ],
}) as UserConfig;

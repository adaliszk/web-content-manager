import { type Options, defineConfig } from "tsup";

const sharedConfig: Partial<Options> = {
    platform: "node",
    target: "node18",
    format: "esm",
    external: ["lightningcss", "esbuild", "postcss", "vite", "zod"],
    tsconfig: "./tsconfig.json",
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
};

// noinspection JSUnusedGlobalSymbols - Used by tsup
export default defineConfig([
    {
        name: "core",
        entry: ["./core/index.ts"],
        outDir: "./dist/core",
        ...sharedConfig,
    },
    {
        name: "internal",
        entry: ["./internal/index.ts"],
        outDir: "./dist/internal",
        ...sharedConfig,
    },
    {
        name: "vite-integration",
        entry: ["./integration/vite.ts"],
        outDir: "./dist/integration",
        ...sharedConfig,
    },
]);

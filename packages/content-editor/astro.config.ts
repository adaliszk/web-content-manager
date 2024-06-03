import { defineConfig } from "astro/config";
import vite from "./vite.config.ts";

// Integrations & Plugins
import parseMdx from "@astrojs/mdx";
import compileTailwind from "@astrojs/tailwind";
import compileQwik from "@qwikdev/astro";
import shareGlobal from "astro-global";
import serveIcons from "astro-icon";

// https://astro.build/config
export default defineConfig({
    output: "server",
    integrations: [shareGlobal(), parseMdx(), compileTailwind(), serveIcons(), compileQwik()],
    publicDir: "assets",
    vite,
});

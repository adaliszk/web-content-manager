import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import vite from "./vite.config.ts";

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: "Headless CMS",
            social: {
                github: "https://github.com/withastro/starlight",
            },
            sidebar: [
                {
                    label: "Guides",
                    items: [
                        // Each item here is one entry in the navigation menu.
                        { label: "Example Guide", link: "/guides/example/" },
                    ],
                },
                {
                    label: "Reference",
                    autogenerate: { directory: "reference" },
                },
            ],
        }),
    ],
    vite,
});

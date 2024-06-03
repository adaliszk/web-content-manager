import { defineCollection, r, root, z } from "@adaliszk/content-manager";

export const pages = defineCollection({
    format: "markdown",
    content: r`${root("pages")}/.*.mdx?`,
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        image: z.string().url().optional(),
    }),
});

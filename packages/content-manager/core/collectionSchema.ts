import { z } from "zod";

/**
 * Defines the minimal frontmatter content for a collection entry.
 * This is required so that the editor and your application can use the absolute minimum to display or edit your content.
 */
export const MinimalCollectionEntrySchema = z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z](-?[a-z])*$/),
});

export type MinimalCollectionEntry = z.infer<typeof MinimalCollectionEntrySchema>;

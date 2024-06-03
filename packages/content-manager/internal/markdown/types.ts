export type MarkdownImport = {
    frontmatter: Record<string, unknown>;
    default: () => string;
};

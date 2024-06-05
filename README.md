!['Tests Status'](https://img.shields.io/github/actions/workflow/status/adaliszk/web-content-manager/code-quality.yml?style=for-the-badge&label=TESTS)

> [!WARNING]
> This project is still in the early stages of development and is not ready for production use yet.

# Headless Content Manager for your Web Project

An Astro inspired headless content management system for your vite or astro projects. The CMS is build with the mindset
of connecting to your datasource and providing a simple and intuitive interface for content management without pushing
needless tolling for parsing the content itself.

Essentially, the CMS here does not work standalone by design, and you need to provide a way to interface with the data
you have with your own logic with a few helper presets. This way you would be able to author your files, database or
whatever without the CMS making assumptions on how to "best" do that.

### Features

- [x] **Headless**: Works without a backend or with your data provider of choice.
- [x] **Pluggable**: You bring your own data providers, no need to adopt yet another CMS tooling.
- [x] **Static-first**: All content is prepared for ultra-fast SSG build and SSR render times.
- [x] **Flexible**: Content Collections supercharged with indexing, partitioning, and computed fields.
- [x] **Editor**: Local or Self-hosted editor for intuitive multilingual content management.

### Roadmap

**MVP Milestone**

- [x] Initialize the monorepo workspaces
- [x] MVP implementation for the Vite Plugin
- [x] MVP layout for the Editor UI
- [ ] MVP data provider with filesystem
  - [x] Read access patterns: collections, collection, entries, entry
  - [ ] Write access patterns: create, update, delete
  - [ ] Frontmatter validation and form generation
  - [ ] Content chunking for Notion-like blocks
- [ ] MVP body and frontmatter editor
  - [ ] Main editor with a mix of notion blocks and obsidian inline editables
  - [ ] Frontmatter manager with dynamic forms
  - [x] Notion-block level "intellisense" plugins
  - [ ] Content component extensions
- [ ] Refactor API to expose integrations
- [ ] Automate the release process

### Idea

Install a simple vite plugin to process your content before you would use them in any web frameworks:

```typescript
/// vite.config.ts
import {webConfig} from "@adaliszk/web-compiler"; // Handy meta-package
import {importContent} from "@adaliszk/content-manager/vite";

// An existing markdown parser for the example, but this can be any other framework like Astro, Qwik-City, etc.
import parseMarkdown from "vite-plugin-markdown";

export default webConfig({
    plugins: [
        parseMarkdown(),
        importContent({
            collections: [
                "file://content/config.ts", // Relative from the vite config file
            ],
        }),
    ]
});
```

Define the content collections in your `content/config.ts` file:

```typescript
/// content/config.ts
import {defineCollection, z, r, root, lang, name, any} from "@adaliszk/content-manager";

export const articles = defineCollection({
    format: "markdown", // forces /\.mdx?$/i suffix
    content: r`${root('articles')}/${lang(r`[a-z]{2}`)}/${any()}/${name(r`[a-z0-9_-]+`)}`, // adds meaning to the path
    schema: z.object({
        title: z.string(),
        description: z.string(),
        keywords: z.array(z.string()),
        status: z.enum(["draft", "preview", "published", "archived"]),
        publishedAt: z.string().datetime().optional(),
    }),
    compute: {
        keywords: ({rawContent}) => { // Injects the value before parsing the frontmatter and persists it on change
            // Do your magic here and extract the keywords from the content
            return ["foo", "bar", "baz"];
        }
    },
    index: {
        byStatus: { // creates a "byStatus" export that ...
            partition: ({status}) => status, // ... is exposing groups of content by status field
            sort: (a, b) => { // ... is sorted by publishedAt field within each group
                return (a.data.publishedAt.getTime() ?? a.updatedAt.getTime())
                    - (a.data.publishedAt.getTime() ?? b.updatedAt.getTime());
            },
        },
    },
});
```

Import as normal and get the benefit of pre-processed static content imports that synergies with your existing
markdown solution:

```typescript jsx
/// src/routes/index.tsx
import {component$} from "@builder.io/qwik";
import {byStatus} from "../../content/articles/index.ts"; // Ideally you should add the path to your tsconfig.json

export default component$(() => {
    return (
        <section class={"flex flex-col"}>
            {byStatus.get("published").map(({id, data, Content}) => (
                <article key={id} class={"m-4"}>
                    <h3>{data.title}</h3>
                    <Content/>
                </article>
            ))}
        </section>
    )
})
```

With the pre-processed content, can simplify your project data access as the content is prepared for your use-cases
already. Additionally, you will have a framework-agnostic way to author and manage your content with fully typed without
doing any background magic of hidden type definition files or virtual packages.

### Contributing

While this project is still in the early stages of development, I would love to hear your feedback and ideas and any
contributions are welcomed!

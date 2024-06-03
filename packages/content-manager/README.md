# Static-Content Manager for Web Projects

Helper package that is inspired by Astro to manage Markdown files for any Vite
projects. It exposes a collection manager solution where you can define content
collections, their indexes and sorting rules.

Add the package to your project:

```bash
pnpm add --save-dev @adaliszk/web-content-manager
```

Configure Vite

```typescript
/// vite.config.ts
import {qwikConfig} from "@adaliszk/qwik" // Handy meta-package
import {importContent} from "@adaliszk/web-content-manager/vite"

export default qwikConfig({
    plugins: [
        importContent({
            collections: [
                "file://content/collections.ts",
            ],
        }),
    ]
})
```  

Configure the content collections:

```typescript
/// content/collection.ts
import {defineCollection, z, r} from "@adaliszk/web-content-manager"

export const articles = defineCollection({
    content: r`^/articles/(?<id>[a-z-]+).mdx?$`,
    format: "markdown",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        keywords: z.array(z.string()).optional(),
        status: z.enum(["draft", "preview", "published", "archived"]),
        publishedAt: z.string().datetime().optional(),
    }),
    index: {
        byStatus: {
            partition: ({status}) => status,
            sort: (a, b) =>
                (a.data.publishedAt.getTime() ?? a.updatedAt.getTime())
                - (a.data.publishedAt.getTime() ?? b.updatedAt.getTime()),
        },
    },
})
```  

Add the path to your Typescript Config:

```json
{
  "extends": "@adaliszk/qwik",
  "compilerOptions": {
    "paths": {
      "~content/*": [
        "content/*"
      ],
      "~": [
        "src/*"
      ]
    }
  }
}
```

Use the collections in your project:
```typescript jsx
/// src/routes/index.tsx
import {component$} from "@builder.io/qwik"
import {byStatus} from "~content/articles"

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
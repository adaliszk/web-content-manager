# Headless Content Manager for your Web Project

An Astro inspired headless content management system for your vite or astro projects. The CMS is build with the mindset
of connecting to your datasource and providing a simple and intuitive interface for file-based content management.

### Features

- [x] **Headless**: Works without a backend or with your data provider of choice.
- [x] **Flexible**: Content Collections supercharged with indexing, partitioning, and computed fields.
- [x] **Editor**: Local or Self hosted editor for intuitive multilingual content management.

### Installation

1. Install and add the CMS to your project:
   ```bash
   pnpm create @adaliszk/content-manager
   ```
2. Run the local editor:
   ```bash
   pnpm dev --editor
   ```
3. Visit http://localhost:9000 in your browser

### MVP TO-DO List

- [ ] Initialize the monorepo workspaces
- [ ] MVP implementation for the Vite Plugin
- [ ] MVP layout for the Editor
- [ ] MVP data provider with filesystem
- [ ] MVP data provider with database
- [ ] Build & Publish Documentation
- [ ] Automate the release process
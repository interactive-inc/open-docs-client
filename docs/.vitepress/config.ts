import { defineConfig } from "vitepress"

export default defineConfig({
  srcExclude: ["studio/debug", "studio/features", "studio/pages"],
  /** https://vitepress.dev/guide/deploy#setting-a-public-base-path */
  base: "/open-docs-client/",
  title: "@interactive-inc/docs-client",
  description: "A VitePress Site",
  appearance: "force-dark",
  // locales: {
  //   root: {
  //     label: "English",
  //     lang: "en",
  //   },
  //   fr: {
  //     label: "日本語",
  //     lang: "ja",
  //   },
  // },
  themeConfig: {
    nav: [
      { text: "Client", link: "/guides/" },
      { text: "API", link: "/modules/" },
      { text: "Studio", link: "/studio" },
    ],
    sidebar: [
      {
        text: "Guides",
        items: [
          { text: "Overview", link: "/guides/" },
          { text: "Markdown", link: "/guides/markdown" },
          { text: "Reading Files", link: "/guides/read" },
          { text: "Writing Files", link: "/guides/write" },
        ],
      },
      {
        text: "Studio",
        items: [{ text: "Overview", link: "/studio/" }],
      },
      {
        text: "Design",
        items: [
          { text: "File Types", link: "/design/file-types" },
          { text: "Reference", link: "/design/reference" },
          { text: "Immutability", link: "/design/immutability" },
          { text: "Archive System", link: "/design/archive" },
          { text: "Schema System", link: "/design/schema-system" },
          { text: "Relations", link: "/design/relations" },
        ],
      },
      {
        text: "API",
        items: [
          { text: "Overflow", link: "/modules/" },
          { text: "DocClient", link: "/modules/doc-client" },
          {
            text: "DocSchemaBuilder",
            link: "/modules/doc-schema-builder",
          },
          {
            text: "DocDirectoryReference",
            link: "/modules/doc-directory-reference",
          },
          {
            text: "DocFileMdReference",
            link: "/modules/doc-file-md-reference",
          },
          {
            text: "DocFileMdEntity",
            link: "/modules/doc-file-md-entity",
          },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/interactiive-inc/open-docs-client",
      },
    ],
    search: {
      provider: "local",
    },
    footer: {
      message: "MIT License.",
      copyright: "© 2025-present Interactive Inc.",
    },
  },
})

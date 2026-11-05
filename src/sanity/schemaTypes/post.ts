import { defineField, defineType } from "sanity";

/**
 * A blog post. Mirrors the frontmatter fields the existing /content/blog/*.md files use
 * (title, description, date, tags, image, keyword), plus SEO fields and a rich-text body so
 * H1/H2 structure and alt text stay editable without code.
 */
export default defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO & Meta" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title (H1)",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (shown in the blog list and used as the meta description unless one is set below)",
      type: "text",
      rows: 2,
      group: "content",
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "publishedAt",
      title: "Publish date",
      type: "date",
      group: "content",
      initialValue: () => new Date().toISOString().slice(0, 10),
      description: "Posts dated in the future stay hidden until that day.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "topic",
      title: "Topic",
      type: "string",
      group: "content",
      description: "Which hub page this post belongs to, e.g. Chairs, Tables, Weddings, Parties.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      group: "content",
    }),
    defineField({
      name: "mainImage",
      title: "Hero image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Required: describes the image for screen readers and Google Images.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        },
        {
          type: "object",
          name: "html",
          title: "HTML block (imported content)",
          description: "Raw HTML carried over from an imported guide — a diagram, table or styled callout the rich-text editor can't represent. Shows on the site exactly as before; edit as HTML, not as text.",
          fields: [defineField({ name: "code", title: "HTML", type: "text", rows: 6, validation: (rule) => rule.required() })],
          preview: { select: { code: "code" }, prepare: ({ code }) => ({ title: "HTML block", subtitle: (code ?? "").slice(0, 60) }) },
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faqs",
      title: "Frequently asked questions",
      description: "Shown on the post and included in the page's FAQ structured data for Google and AI assistants.",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "answer", type: "text", rows: 3, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "question" } },
        },
      ],
    }),
    defineField({
      name: "metaTitle",
      title: "Meta title (optional, overrides Title for the browser tab/Google)",
      type: "string",
      group: "seo",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description (optional, overrides Description for Google)",
      type: "text",
      rows: 2,
      group: "seo",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "keyword",
      title: "Target search keyword",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "importedFrom",
      title: "Imported from",
      type: "string",
      hidden: true,
      description: "Set by the one-time Markdown import script; identifies posts carried over from /content/blog so the import can be safely re-run.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "topic", media: "mainImage" },
  },
});

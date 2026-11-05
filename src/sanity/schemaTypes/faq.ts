import { defineField, defineType } from "sanity";

/**
 * Extra FAQ entries for the /faq page. Appended after the page's existing groups, so
 * new questions can be added here without touching code.
 */
export default defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "group",
      title: "Group",
      type: "string",
      description: "Which section of the FAQ page this appears under. Leave blank for a new \"More questions\" section.",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers show first within the group.",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "group" },
  },
});

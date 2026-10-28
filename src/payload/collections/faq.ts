import type { CollectionConfig } from "payload";
import { activeField, groups, l } from "@/payload/fields";
import { revalidateAfterChange, revalidateAfterDelete } from "@/payload/hooks/revalidate-site";

/** Questions about getting a website made, on the Services page and in Google (FAQPage). */
export const Faq: CollectionConfig = {
  slug: "faq",
  labels: {
    singular: l("Sual", "Question", "Вопрос"),
    plural: l("Tez-tez verilən suallar", "FAQ", "Частые вопросы"),
  },
  orderable: true,
  admin: {
    group: groups.content,
    useAsTitle: "question",
    defaultColumns: ["question", "active"],
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      name: "question",
      label: l("Sual", "Question", "Вопрос"),
      type: "text",
      localized: true,
      required: true,
    },
    { name: "answer", label: l("Cavab", "Answer", "Ответ"), type: "textarea", localized: true },
    activeField(),
  ],
};

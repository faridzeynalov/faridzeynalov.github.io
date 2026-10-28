import type { CollectionConfig } from "payload";
import {
  activeField,
  adminTitleField,
  groups,
  i18nField,
  l,
  setAdminTitle,
} from "@/payload/fields";
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
    useAsTitle: "adminTitle",
    defaultColumns: ["adminTitle", "active"],
  },
  access: { read: () => true },
  hooks: {
    beforeChange: [setAdminTitle("question")],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    i18nField("question", l("Sual", "Question", "Вопрос"), { required: true }),
    i18nField("answer", l("Cavab", "Answer", "Ответ"), { long: true }),
    activeField(),
    { ...adminTitleField, label: l("Sual", "Question", "Вопрос") },
  ],
};

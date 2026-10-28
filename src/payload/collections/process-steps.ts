import type { CollectionConfig } from "payload";
import { activeField, groups, l } from "@/payload/fields";
import { revalidateAfterChange, revalidateAfterDelete } from "@/payload/hooks/revalidate-site";

/** How a project runs, step by step, on the Services page. */
export const ProcessSteps: CollectionConfig = {
  slug: "process-steps",
  labels: {
    singular: l("Mərhələ", "Step", "Этап"),
    plural: l("İş prosesi", "Process", "Процесс работы"),
  },
  orderable: true,
  admin: {
    group: groups.content,
    useAsTitle: "title",
    defaultColumns: ["title", "description", "active"],
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      name: "title",
      label: l("Ad", "Name", "Название"),
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "description",
      label: l("Təsvir", "Description", "Описание"),
      type: "textarea",
      localized: true,
    },
    activeField(),
  ],
};

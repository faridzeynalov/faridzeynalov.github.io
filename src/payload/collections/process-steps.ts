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
    useAsTitle: "adminTitle",
    defaultColumns: ["adminTitle", "active"],
  },
  access: { read: () => true },
  hooks: {
    beforeChange: [setAdminTitle("title")],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    i18nField("title", l("Ad", "Name", "Название"), { required: true }),
    i18nField("description", l("Təsvir", "Description", "Описание"), { long: true }),
    activeField(),
    { ...adminTitleField, label: l("Ad", "Name", "Название") },
  ],
};

import type { CollectionConfig } from "payload";
import { publicContent } from "@/payload/access";
import {
  activeField,
  adminTitleField,
  groups,
  i18nField,
  i18nLinesField,
  l,
  setAdminTitle,
  toggleField,
} from "@/payload/fields";
import { revalidateAfterChange, revalidateAfterDelete } from "@/payload/hooks/revalidate-site";

/** What I offer: the Services page, the home page's services and the mobile menu. */
export const Services: CollectionConfig = {
  slug: "services",
  labels: {
    singular: l("Xidmət", "Service", "Услуга"),
    plural: l("Xidmətlər", "Services", "Услуги"),
  },
  orderable: true,
  admin: {
    group: groups.content,
    useAsTitle: "adminTitle",
    defaultColumns: ["adminTitle", "key", "active", "showOnHome"],
    description: l(
      "Sıranı dəyişmək üçün sətirləri sürüşdürün.",
      "Drag the rows to change the order.",
      "Перетащите строки, чтобы изменить порядок.",
    ),
  },
  access: publicContent,
  hooks: {
    beforeChange: [setAdminTitle("title")],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    i18nField("title", l("Ad", "Name", "Название"), { required: true }),
    i18nField("tagline", l("Qısa sətir", "Tagline", "Краткая строка")),
    i18nField("description", l("Təsvir", "Description", "Описание"), { long: true }),
    i18nLinesField("deliverables", l("Nə daxildir", "What's included", "Что входит")),
    {
      name: "key",
      label: l("Açar", "Key", "Ключ"),
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        description: l(
          "Latın hərfləri; ünvanda #açar kimi görünür, məsələn frontend.",
          "Latin letters; used in the address as #key, e.g. frontend.",
          "Латинские буквы; в адресе как #ключ, например frontend.",
        ),
      },
    },
    {
      name: "icon",
      label: l("İkon", "Icon", "Иконка"),
      type: "select",
      required: true,
      defaultValue: "code",
      admin: { position: "sidebar" },
      options: [
        { label: l("Kod", "Code", "Код"), value: "code" },
        { label: l("Palitra", "Palette", "Палитра"), value: "palette" },
        { label: l("Sürət", "Speed", "Скорость"), value: "gauge" },
        { label: l("Süni intellekt", "AI", "ИИ"), value: "sparkles" },
        { label: l("İnteqrasiya", "Integration", "Интеграция"), value: "plug" },
        { label: l("Dəstək", "Maintenance", "Поддержка"), value: "wrench" },
      ],
    },
    activeField(),
    toggleField(
      "showOnHome",
      l("Ana səhifədə göstər", "Show on the home page", "Показывать на главной"),
    ),
    { ...adminTitleField, label: l("Ad", "Name", "Название") },
  ],
};

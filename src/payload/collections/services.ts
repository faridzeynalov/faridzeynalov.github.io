import type { CollectionConfig } from "payload";
import { activeField, groups, l, linesField, toggleField } from "@/payload/fields";
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
    useAsTitle: "title",
    defaultColumns: ["title", "tagline", "active", "showOnHome"],
    description: l(
      "Sıranı dəyişmək üçün sətirləri sürüşdürün.",
      "Drag the rows to change the order.",
      "Перетащите строки, чтобы изменить порядок.",
    ),
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "title",
          label: l("Ad", "Name", "Название"),
          type: "text",
          localized: true,
          required: true,
        },
        {
          name: "key",
          label: l("Açar", "Key", "Ключ"),
          type: "text",
          required: true,
          unique: true,
          admin: {
            description: l(
              "Latın hərfləri; ünvanda #açar kimi görünür, məsələn frontend.",
              "Latin letters; used in the address as #key, e.g. frontend.",
              "Латинские буквы; в адресе как #ключ, например frontend.",
            ),
          },
        },
      ],
    },
    {
      name: "tagline",
      label: l("Qısa sətir", "Tagline", "Краткая строка"),
      type: "text",
      localized: true,
    },
    {
      name: "description",
      label: l("Təsvir", "Description", "Описание"),
      type: "textarea",
      localized: true,
    },
    linesField("deliverables", l("Nə daxildir", "What's included", "Что входит")),
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
  ],
};

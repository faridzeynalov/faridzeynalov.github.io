import type { CollectionConfig } from "payload";
import { groups, l } from "@/payload/fields";
import { revalidateAfterChange, revalidateAfterDelete } from "@/payload/hooks/revalidate-site";

/**
 * Every interface text on the site (buttons, menus, headings, labels), one row per message key
 * from messages/*.json. An empty value keeps the built-in text for that language.
 */
export const Translations: CollectionConfig = {
  slug: "translations",
  labels: {
    singular: l("Tərcümə", "Translation", "Перевод"),
    plural: l("Tərcümələr", "Translations", "Переводы"),
  },
  admin: {
    group: groups.settings,
    useAsTitle: "key",
    defaultColumns: ["key", "value", "section"],
    listSearchableFields: ["key", "value"],
    pagination: { defaultLimit: 50 },
    description: l(
      "Saytdakı düymələr, menyu, başlıqlar və digər mətnlər. {name} kimi fiqurlu mötərizədəki sözləri olduğu kimi saxlayın: onların yerinə sayt özü dəyər qoyur.",
      "Buttons, menus, headings and other texts on the site. Keep words in curly braces such as {name} as they are: the site fills them in.",
      "Кнопки, меню, заголовки и другие тексты сайта. Слова в фигурных скобках, например {name}, оставляйте как есть: сайт подставляет их сам.",
    ),
  },
  defaultSort: "key",
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      name: "key",
      label: l("Açar", "Key", "Ключ"),
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: "section",
      label: l("Bölmə", "Section", "Раздел"),
      type: "text",
      index: true,
      admin: { readOnly: true, position: "sidebar" },
    },
    { name: "value", label: l("Mətn", "Text", "Текст"), type: "textarea", localized: true },
  ],
};

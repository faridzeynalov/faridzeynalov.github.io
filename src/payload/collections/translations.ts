import type { CollectionConfig, TextareaField } from "payload";
import { groups, l, LANGS } from "@/payload/fields";
import { revalidateAfterChange, revalidateAfterDelete } from "@/payload/hooks/revalidate-site";

/**
 * Every interface text on the site (buttons, menus, headings, labels), one row per message key
 * from messages/*.json, with a column per language. An empty language keeps the built-in text.
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
    defaultColumns: ["key", "az", "en", "ru"],
    listSearchableFields: ["key", "az", "en", "ru"],
    pagination: { defaultLimit: 50 },
    description: l(
      "Saytdakı düymələr, menyu, başlıqlar və digər mətnlər. {name} kimi fiqurlu mötərizədəki sözləri olduğu kimi saxlayın: onların yerinə sayt özü dəyər qoyur.",
      "Buttons, menus, headings and other texts on the site. Keep words in curly braces such as {name} as they are: the site fills them in.",
      "Кнопки, меню, заголовки и другие тексты сайта. Слова в фигурных скобках, например {name}, оставляйте как есть: сайт подставляет их сам.",
    ),
  },
  defaultSort: "key",
  // Rows come from messages/*.json (npm run seed): a key the site doesn't use would do nothing.
  access: { read: () => true, create: () => false },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: "row",
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
          admin: { readOnly: true },
        },
      ],
    },
    {
      type: "row",
      admin: { className: "fz-i18n-row" },
      fields: LANGS.map((lang): TextareaField => ({
        name: lang,
        label: lang.toUpperCase(),
        type: "textarea",
      })),
    },
  ],
};

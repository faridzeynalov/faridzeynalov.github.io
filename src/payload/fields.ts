import type {
  CheckboxField,
  CollectionBeforeChangeHook,
  GroupField,
  TextField,
  TextareaField,
} from "payload";

/** Admin labels and help texts in the panel's three languages. */
export type Label = { az: string; en: string; ru: string };

export function l(az: string, en: string, ru: string): Label {
  return { az, en, ru };
}

/** Sidebar groups. */
export const groups = {
  content: l("Məzmun", "Content", "Контент"),
  settings: l("Ayarlar", "Settings", "Настройки"),
  system: l("Sistem", "System", "Система"),
};

/** The languages the site is written in, in the order their inputs appear. */
export const LANGS = ["az", "en", "ru"] as const;
export type Lang = (typeof LANGS)[number];

/** A text in every language, as stored by i18nField. */
export type I18nValue = Partial<Record<Lang, string | null>> | null | undefined;

const langLabels: Record<Lang, string> = { az: "AZ", en: "EN", ru: "RU" };

const linesHelp = l("Hər sətirdə bir maddə.", "One item per line.", "По одному пункту в строке.");

/**
 * One text in all three languages: an input per language under one label, side by side on wide
 * screens (stacked for long texts and on phones, see custom.css), so every language is edited in
 * the same form without switching the admin's language.
 */
export function i18nField(
  name: string,
  label: Label | false,
  options: { long?: boolean; lines?: boolean; description?: Label; required?: boolean } = {},
): GroupField {
  const type = options.long || options.lines ? "textarea" : "text";
  return {
    name,
    label,
    type: "group",
    admin: {
      className: options.long || options.lines ? "fz-i18n fz-i18n--long" : "fz-i18n",
      description: options.lines ? linesHelp : options.description,
    },
    fields: [
      {
        type: "row",
        fields: LANGS.map(
          (lang) =>
            ({
              name: lang,
              label: langLabels[lang],
              type,
              required: options.required && lang === "az",
            }) as TextField | TextareaField,
        ),
      },
    ],
  };
}

/** A list edited as one item per line, in every language (deliverables, features). */
export function i18nLinesField(name: string, label: Label): GroupField {
  return i18nField(name, label, { lines: true });
}

/** A list edited as one item per line, the same in every language (the tech stack). */
export function linesField(name: string, label: Label): TextareaField {
  return { name, label, type: "textarea", admin: { description: linesHelp } };
}

/** The text in one language, or "" when that language was left empty. */
export function pick(value: I18nValue, lang: Lang): string {
  return value?.[lang]?.trim() ?? "";
}

/** The first language that has the text: what the admin's lists show as an item's name. */
export function firstFilled(value: I18nValue): string {
  return LANGS.map((lang) => pick(value, lang)).find(Boolean) ?? "";
}

/** Splits a lines field back into a list. */
export function splitLines(value: string | null | undefined): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * The name the admin's lists and links show for an item whose title is in three languages:
 * a hidden field kept equal to the first language that has the title.
 */
export const adminTitleField: TextField = {
  name: "adminTitle",
  type: "text",
  admin: { hidden: true },
};

export function setAdminTitle(source: string): CollectionBeforeChangeHook {
  return ({ data }) => {
    // Partial saves (a switch flipped in the list) don't carry the title: keep the old name.
    if (!data || !(source in data)) return data;
    return { ...data, adminTitle: firstFilled(data[source] as I18nValue) };
  };
}

/**
 * An on/off switch shown in the sidebar of the edit view and as a clickable toggle in the list
 * view (see components/toggle-cell.tsx), so items can be switched without opening them.
 */
export function toggleField(name: string, label: Label, defaultValue = true): CheckboxField {
  return {
    name,
    label,
    type: "checkbox",
    defaultValue,
    admin: {
      position: "sidebar",
      components: { Cell: "/payload/components/toggle-cell#ToggleCell" },
    },
  };
}

/** Shown on the site. Hidden items stay in the admin. */
export const activeField = () =>
  toggleField(
    "active",
    l("Aktiv (saytda görünür)", "Active (shown on the site)", "Активно (видно на сайте)"),
  );

/** A checkbox inside an array row (rows have no list view). */
export const rowActiveField: CheckboxField = {
  name: "active",
  label: l("Aktiv", "Active", "Активно"),
  type: "checkbox",
  defaultValue: true,
};

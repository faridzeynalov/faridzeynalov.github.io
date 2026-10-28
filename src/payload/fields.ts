import type { CheckboxField, TextareaField } from "payload";

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

/** A list edited as one item per line (deliverables, features, stack). */
export function linesField(
  name: string,
  label: Label,
  options: { localized?: boolean } = {},
): TextareaField {
  return {
    name,
    label,
    type: "textarea",
    localized: options.localized ?? true,
    admin: {
      description: l("Hər sətirdə bir maddə.", "One item per line.", "По одному пункту в строке."),
    },
  };
}

/** Splits a lines field back into a list. */
export function splitLines(value: string | null | undefined): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
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

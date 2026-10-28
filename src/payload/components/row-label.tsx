"use client";

import { useRowLabel, useTranslation } from "@payloadcms/ui";

const hidden = { az: "gizli", en: "hidden", ru: "скрыто" } as const;

type Texts = { az?: string | null; en?: string | null; ru?: string | null } | null | undefined;

/** A row's text in the admin's language, else the first language that has it. */
function textOf(value: Texts, language: string) {
  if (!value) return "";
  const own = value[language as keyof NonNullable<Texts>]?.trim();
  return own || [value.az, value.en, value.ru].map((text) => text?.trim()).find(Boolean) || "";
}

/** Names collapsed array rows after their title instead of "Row 01", and marks hidden ones. */
export function RowLabel() {
  const { data, rowNumber } = useRowLabel<{
    title?: Texts;
    name?: Texts;
    role?: Texts;
    degree?: Texts;
    text?: Texts;
    active?: boolean;
  }>();
  const { i18n } = useTranslation();
  const label =
    textOf(data?.title, i18n.language) ||
    textOf(data?.name, i18n.language) ||
    textOf(data?.role, i18n.language) ||
    textOf(data?.degree, i18n.language) ||
    textOf(data?.text, i18n.language).slice(0, 60);
  return (
    <span className={data?.active === false ? "fz-row-hidden" : undefined}>
      {label || `#${(rowNumber ?? 0) + 1}`}
      {data?.active === false && (
        <em> · {hidden[i18n.language as keyof typeof hidden] ?? hidden.en}</em>
      )}
    </span>
  );
}

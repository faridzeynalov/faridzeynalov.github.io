"use client";

import { useRowLabel, useTranslation } from "@payloadcms/ui";

const hidden = { az: "gizli", en: "hidden", ru: "скрыто" } as const;

/** Names collapsed array rows after their title instead of "Row 01", and marks hidden ones. */
export function RowLabel() {
  const { data, rowNumber } = useRowLabel<{
    title?: string;
    name?: string;
    role?: string;
    degree?: string;
    text?: string;
    active?: boolean;
  }>();
  const { i18n } = useTranslation();
  const label = data?.title || data?.name || data?.role || data?.degree || data?.text?.slice(0, 60);
  return (
    <span className={data?.active === false ? "fz-row-hidden" : undefined}>
      {label || `#${(rowNumber ?? 0) + 1}`}
      {data?.active === false && (
        <em> · {hidden[i18n.language as keyof typeof hidden] ?? hidden.en}</em>
      )}
    </span>
  );
}

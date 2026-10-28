"use client";

import { toast, useConfig, useTranslation } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

interface ToggleCellProps {
  cellData?: unknown;
  rowData?: { id?: number | string };
  collectionSlug?: string;
  field?: { name?: string };
}

/**
 * A checkbox column in a collection's list view, as a switch: one click saves the new value
 * without opening the item.
 */
export function ToggleCell({ cellData, rowData, collectionSlug, field }: ToggleCellProps) {
  const { config } = useConfig();
  const { i18n } = useTranslation();
  const router = useRouter();
  const [on, setOn] = useState(Boolean(cellData));
  const [saving, setSaving] = useState(false);
  const name = field?.name;

  async function toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!name || !rowData?.id || !collectionSlug || saving) return;
    const next = !on;
    setOn(next);
    setSaving(true);
    try {
      const response = await fetch(`${config.routes.api}/${collectionSlug}/${rowData.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [name]: next }),
      });
      if (!response.ok) throw new Error(String(response.status));
      router.refresh();
    } catch {
      setOn(!next);
      toast.error(i18n.t("error:unknown"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-busy={saving}
      onClick={toggle}
      className={on ? "fz-switch is-on" : "fz-switch"}
    >
      <span className="fz-switch__thumb" />
    </button>
  );
}

"use client";

import { useRowLabel } from "@payloadcms/ui";

const marks: Record<string, string> = { todo: "○", in_progress: "◐", review: "◑", done: "●" };

/** A stage row named after the stage, with a mark for its status (○ to ●). */
export function StageRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string; status?: string }>();
  return (
    <span className={`fz-stage-label fz-stage-label--${data?.status ?? "todo"}`}>
      <span aria-hidden>{marks[data?.status ?? "todo"] ?? "○"}</span>{" "}
      {data?.name || `#${(rowNumber ?? 0) + 1}`}
    </span>
  );
}

"use client";

import { useState } from "react";
import {
  PANEL_STYLE_COOKIE,
  PANEL_STYLES,
  type PanelStyle,
} from "@/payload/components/panel-style-shared";

/**
 * Classic follows the site, Developer is the site's code-editor style (mono, GitHub colours,
 * green), VS Code borrows the editor's Dark+ / Light+ themes, Plain drops the decoration.
 * custom.css reads the [data-fz-style-marker] element that NavBadges renders from the cookie.
 */
const names: Record<string, Record<PanelStyle, string>> = {
  az: { classic: "Klassik", developer: "Developer", vscode: "VS Code", plain: "Sadə" },
  en: { classic: "Classic", developer: "Developer", vscode: "VS Code", plain: "Plain" },
  ru: { classic: "Классика", developer: "Developer", vscode: "VS Code", plain: "Простой" },
};

function apply(style: PanelStyle) {
  document.cookie = `${PANEL_STYLE_COOKIE}=${style}; path=/; max-age=31536000; samesite=lax`;
  document
    .querySelectorAll("[data-fz-style-marker]")
    .forEach((marker) => marker.setAttribute("data-fz-style-marker", style));
}

export function PanelStylePicker({
  label,
  language,
  initial,
}: {
  label: string;
  language: string;
  initial: PanelStyle;
}) {
  const [style, setStyle] = useState<PanelStyle>(initial);
  const labels = names[language] ?? names.en;

  return (
    <div className="fz-style" role="radiogroup" aria-label={label}>
      <span className="fz-style__label">{label}</span>
      <span className="fz-style__options">
        {PANEL_STYLES.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={style === option}
            className={style === option ? "fz-style__option is-active" : "fz-style__option"}
            onClick={() => {
              setStyle(option);
              apply(option);
            }}
          >
            {labels[option]}
          </button>
        ))}
      </span>
    </div>
  );
}

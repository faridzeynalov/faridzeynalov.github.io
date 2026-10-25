"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Industry, Project } from "@/types/project";

/**
 * Developer style: the portfolio in a terminal, split like tmux. The left pane lists the
 * projects (`ls -la projects/`); the right one prints the selected project's README, line by
 * line. ↑ ↓ choose, Enter opens the project; a click does the same.
 */
export function TerminalView({
  projects,
  industryLabels,
}: {
  projects: Project[];
  industryLabels: Record<Industry, string>;
}) {
  const t = useTranslations("Portfolio");
  const router = useRouter();
  const [active, setActive] = useState(0);
  const index = Math.min(active, projects.length - 1);
  const project = projects[index];
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the selected line in view as the selection moves through a long listing.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(Math.max(0, Math.min(projects.length - 1, index + step)));
    }
    if (event.key === "Enter") router.push(`/portfolio/${project.slug}`);
  };

  const readme = [
    { text: `# ${project.name}`, className: "text-[var(--code-keyword)] font-semibold" },
    { text: `> ${project.domain}`, className: "text-[var(--code-comment)]" },
    { text: "", className: "" },
    { text: project.summary, className: "text-fg" },
    { text: "", className: "" },
    {
      text: `industry:  "${industryLabels[project.industry]}"`,
      className: "text-[var(--code-prop)]",
    },
    {
      text: `stack:     [${project.stack.map((item) => `"${item}"`).join(", ")}]`,
      className: "text-[var(--code-string)]",
    },
    {
      text: `languages: [${project.languages.map((item) => `"${item}"`).join(", ")}]`,
      className: "text-[var(--code-string)]",
    },
  ];

  return (
    <div className="mt-10 overflow-hidden rounded-xl border border-border bg-[var(--code-bg)] font-mono text-[13px] shadow-float">
      {/* Window bar */}
      <div className="flex items-center gap-2 border-b border-border bg-frame-bar px-4 py-2.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" aria-hidden />
        <span className="size-3 rounded-full bg-[#febc2e]" aria-hidden />
        <span className="size-3 rounded-full bg-[#28c840]" aria-hidden />
        <span className="ml-3 truncate text-xs text-fg-subtle">zsh — ~/portfolio</span>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* Left pane: the listing */}
        <div className="border-border p-4 max-lg:border-b lg:border-r">
          <p>
            <span className="text-accent">~/portfolio</span>{" "}
            <span className="text-fg-subtle">$</span> ls -la projects/
          </p>
          <p className="text-fg-subtle">total {projects.length}</p>
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={0}
            aria-label={t("terminalView")}
            aria-activedescendant={`term-${project.slug}`}
            onKeyDown={onKeyDown}
            className="mt-1 max-h-[22rem] [scrollbar-width:thin] overflow-y-auto outline-none"
          >
            {projects.map((item, i) => (
              <li
                key={item.slug}
                id={`term-${item.slug}`}
                data-index={i}
                role="option"
                aria-selected={i === index}
                onClick={() => setActive(i)}
                onDoubleClick={() => router.push(`/portfolio/${item.slug}`)}
                className={cn(
                  "flex cursor-pointer gap-3 rounded px-1.5 whitespace-pre",
                  i === index ? "bg-accent text-accent-fg" : "hover:bg-bg-subtle",
                )}
              >
                <span className={i === index ? "" : "text-fg-subtle"}>drwxr-xr-x</span>
                <span className={cn("w-8 text-right", i === index ? "" : "text-fg-subtle")}>
                  {item.stack.length || "-"}
                </span>
                <span
                  className={cn(
                    "hidden w-28 truncate sm:inline",
                    i === index ? "" : "text-[var(--code-prop)]",
                  )}
                >
                  {item.industry}
                </span>
                <span className="min-w-0 truncate font-semibold">{item.slug}/</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right pane: the README, printed line by line */}
        <div className="min-h-[18rem] p-4">
          <p>
            <span className="text-accent">~/portfolio</span>{" "}
            <span className="text-fg-subtle">$</span> cat projects/{project.slug}/README.md
          </p>
          <div key={project.slug} className="mt-2 space-y-0.5">
            {readme.map((line, i) => (
              <p
                key={i}
                className={cn("terminal-line min-h-[1.4em] whitespace-pre-wrap", line.className)}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {line.text}
              </p>
            ))}
          </div>
          <p className="terminal-line mt-4" style={{ animationDelay: `${readme.length * 70}ms` }}>
            <span className="text-accent">~/portfolio</span>{" "}
            <span className="text-fg-subtle">$</span>{" "}
            <Link
              href={`/portfolio/${project.slug}`}
              className="underline decoration-accent/60 underline-offset-4 hover:text-accent"
            >
              cd projects/{project.slug}
            </Link>
            <span className="terminal-caret ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-accent" />
          </p>
        </div>
      </div>

      {/* tmux-style status line */}
      <div className="flex items-center justify-between gap-3 bg-accent px-3 py-1 text-[11.5px] text-accent-fg">
        <span>
          [0] portfolio · {index + 1}/{projects.length}
        </span>
        <span className="truncate">{t("terminalHint")}</span>
      </div>
    </div>
  );
}

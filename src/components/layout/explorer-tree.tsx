"use client";

import {
  Atom,
  ChevronRight,
  FileText,
  Braces,
  Filter,
  FolderCode,
  FolderArchive,
  FolderCog,
  FolderHeart,
  FolderInput,
  FolderKanban,
  Folder,
  FolderOpen,
  Hash,
  Link2,
  Mail,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useLocale } from "next-intl";
import NextLink from "next/link";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_STORAGE_KEY } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { cn } from "@/lib/utils";
import type { TreeFile, TreeFileIcon, TreeFolder, TreeFolderIcon, TreeNode } from "@/types/nav";

/** Folder icons and colours, loosely after VS Code's Material Icon Theme. */
const folderIcons: Record<TreeFolderIcon, { closed: LucideIcon; open: LucideIcon; color: string }> =
  {
    portfolio: { closed: FolderKanban, open: FolderKanban, color: "#42a5f5" },
    services: { closed: FolderCog, open: FolderCog, color: "#ab47bc" },
    cv: { closed: FolderArchive, open: FolderArchive, color: "#ef5350" },
    about: { closed: FolderHeart, open: FolderHeart, color: "#66bb6a" },
    contact: { closed: FolderInput, open: FolderInput, color: "#ffa726" },
    locales: { closed: FolderCode, open: FolderCode, color: "#26a69a" },
    plain: { closed: Folder, open: FolderOpen, color: "#c09553" },
  };

const fileIcons: Record<TreeFileIcon, { icon: LucideIcon; color: string }> = {
  react: { icon: Atom, color: "#38bdf8" },
  markdown: { icon: FileText, color: "#42a5f5" },
  pdf: { icon: FileText, color: "#ef5350" },
  mail: { icon: Mail, color: "#ffa726" },
  phone: { icon: Phone, color: "#66bb6a" },
  link: { icon: Link2, color: "#29b6f6" },
  hash: { icon: Hash, color: "#a78bfa" },
  filter: { icon: Filter, color: "#ffca28" },
  locale: { icon: Braces, color: "#fbc02d" },
};

const INDENT = 14; // px per level, like VS Code's default tree indent
const ease = [0.16, 1, 0.3, 1] as const;

interface ExplorerTreeProps {
  nodes: TreeNode[];
  /** Current pathname, used for the selected file and auto-expanded folders. */
  pathname: string;
  onNavigate: () => void;
}

export function ExplorerTree({ nodes, pathname, onNavigate }: ExplorerTreeProps) {
  // Open the folder(s) containing the current page; on a project page also open "featured".
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => {
    const open = new Set<string>();
    const visit = (list: TreeNode[], parent: string) => {
      for (const node of list) {
        if (node.kind !== "folder") continue;
        const key = `${parent}/${node.name}`;
        const containsCurrent = node.children.some(
          (child) => child.kind === "file" && samePage(child.href, pathname),
        );
        if ((node.matchPrefix && pathname.startsWith(node.matchPrefix)) || containsCurrent) {
          open.add(key);
        }
        visit(node.children, key);
      }
    };
    visit(nodes, "");
    return open;
  });

  const toggle = (key: string) =>
    setOpenFolders((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <TreeList
      nodes={nodes}
      depth={0}
      parentKey=""
      pathname={pathname}
      openFolders={openFolders}
      onToggle={toggle}
      onNavigate={onNavigate}
      root
    />
  );
}

function TreeList({
  nodes,
  depth,
  parentKey,
  pathname,
  openFolders,
  onToggle,
  onNavigate,
  root = false,
}: {
  nodes: TreeNode[];
  depth: number;
  parentKey: string;
  pathname: string;
  openFolders: Set<string>;
  onToggle: (key: string) => void;
  onNavigate: () => void;
  root?: boolean;
}) {
  return (
    <m.ul
      className="relative"
      {...(root && {
        initial: "hidden",
        animate: "show",
        variants: { show: { transition: { staggerChildren: 0.035, delayChildren: 0.15 } } },
      })}
    >
      {nodes.map((node) => {
        const key = `${parentKey}/${node.name}`;
        return (
          <m.li
            key={key}
            variants={
              root ? { hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } } : undefined
            }
            transition={{ duration: 0.4, ease }}
          >
            {node.kind === "folder" ? (
              <FolderRow
                folder={node}
                folderKey={key}
                depth={depth}
                open={openFolders.has(key)}
                onToggle={() => onToggle(key)}
              >
                <TreeList
                  nodes={node.children}
                  depth={depth + 1}
                  parentKey={key}
                  pathname={pathname}
                  openFolders={openFolders}
                  onToggle={onToggle}
                  onNavigate={onNavigate}
                />
              </FolderRow>
            ) : (
              <FileRow
                file={node}
                depth={depth}
                active={samePage(node.href, pathname)}
                onNavigate={onNavigate}
              />
            )}
          </m.li>
        );
      })}
    </m.ul>
  );
}

function FolderRow({
  folder,
  folderKey,
  depth,
  open,
  onToggle,
  children,
}: {
  folder: TreeFolder;
  folderKey: string;
  depth: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const style = folderIcons[folder.icon];
  const Icon = open ? style.open : style.closed;
  const panelId = `tree${folderKey.replace(/[^a-z0-9]/gi, "-")}`;

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-9 w-full items-center gap-1.5 rounded-[4px] pr-3 text-left font-mono text-[13.5px] text-fg transition-colors hover:bg-bg-subtle focus-visible:outline-offset-[-2px]"
        style={{ paddingLeft: 8 + depth * INDENT }}
      >
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-fg-subtle transition-transform duration-200",
            open && "rotate-90",
          )}
          aria-hidden
        />
        <Icon className="size-[18px] shrink-0" style={{ color: style.color }} aria-hidden />
        <span className="truncate">{folder.name}</span>
        <span className="ml-auto font-sans text-[11px] text-fg-subtle tabular-nums">
          {folder.children.length}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={panelId}
            key="children"
            className="relative overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease }}
          >
            {/* Indent guide, centred under this folder's chevron */}
            <span
              className="pointer-events-none absolute top-0 bottom-1 w-px bg-border-strong"
              style={{ left: 8 + depth * INDENT + 7.5 }}
              aria-hidden
            />
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FileRow({
  file,
  depth,
  active,
  onNavigate,
}: {
  file: TreeFile;
  depth: number;
  active: boolean;
  onNavigate: () => void;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  if (file.switchLocale) active = file.switchLocale === locale;
  const { icon: Icon, color } = fileIcons[file.icon];
  const className = cn(
    "relative flex h-9 items-center gap-1.5 rounded-[4px] pr-3 font-mono text-[13.5px] transition-colors focus-visible:outline-offset-[-2px]",
    active ? "bg-accent-soft text-fg" : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
  );
  // Files sit one chevron-width further in than folders at the same depth.
  const style = { paddingLeft: 8 + depth * INDENT + 20 };
  const content = (
    <>
      {active && (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent" aria-hidden />
      )}
      <Icon className="size-4 shrink-0" style={{ color }} aria-hidden />
      <span className="truncate">{file.name}</span>
      {file.hint && (
        <span className="ml-auto truncate pl-3 font-sans text-[11px] text-fg-subtle">
          {file.hint}
        </span>
      )}
    </>
  );

  if (file.switchLocale) {
    const target = file.switchLocale;
    // The current language isn't a link: opening it again would only reload the page.
    if (target === locale) {
      return (
        <span className={cn(className, "cursor-default")} style={style} aria-current="true">
          {content}
        </span>
      );
    }
    // A plain link to the clean URL: next-intl's locale switch would link English as /en/….
    return (
      <NextLink
        href={localizedPath(target, pathname)}
        hrefLang={target}
        className={className}
        style={style}
        onClick={() => {
          try {
            window.localStorage.setItem(LOCALE_STORAGE_KEY, target);
          } catch {
            // Storage may be blocked; the URL still carries the language.
          }
          onNavigate();
        }}
      >
        {content}
      </NextLink>
    );
  }

  if (file.external || file.download) {
    return (
      <a
        href={file.href}
        className={className}
        style={style}
        onClick={onNavigate}
        {...(file.download ? { download: true } : {})}
        {...(file.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={file.href}
      className={className}
      style={style}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
}

/** A tree link is "the current page" when its path (ignoring hash and query) matches. */
function samePage(href: string, pathname: string) {
  if (/^(mailto|tel|https?):/.test(href)) return false;
  const path = href.split(/[?#]/)[0];
  const hasExtra = /[?#]/.test(href);
  const normalize = (p: string) => (p.endsWith("/") ? p : `${p}/`);
  // Only plain page links (index files) count as current, not their #section/?filter variants.
  return !hasExtra && normalize(path) === normalize(pathname);
}

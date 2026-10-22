/** Front-end fragments scattered behind the content as the cursor moves. */
export const CODE_SNIPPETS = [
  // JSX & React
  "<div />",
  "</>",
  "<>",
  "<Link />",
  "<Image />",
  "<Suspense>",
  "useState()",
  "useEffect()",
  "useMemo()",
  "useCallback()",
  "useRef()",
  "useContext()",
  "useReducer()",
  "useId()",
  "props",
  "children",
  "key={id}",
  "className",
  "onClick",
  "forwardRef",
  "memo()",
  "createContext()",
  // JavaScript & TypeScript
  "=>",
  "{ }",
  "const",
  "let",
  "async",
  "await",
  ".map()",
  ".filter()",
  ".reduce()",
  "?.",
  "??",
  "...rest",
  "Promise",
  "fetch()",
  "JSON.parse()",
  "try { }",
  "export default",
  "import",
  "interface",
  "type Props",
  "enum",
  "as const",
  "keyof",
  "Record<K, V>",
  "Partial<T>",
  "satisfies",
  // Next.js
  "next/image",
  "next/link",
  '"use client"',
  "layout.tsx",
  "page.tsx",
  "generateStaticParams",
  "metadata",
  ".tsx",
  // State & data
  "Redux Toolkit",
  "createSlice()",
  "RTK Query",
  "useSelector()",
  "Zustand",
  "GraphQL",
  "REST API",
  // CSS & layout
  "@media",
  "display: grid",
  "flex",
  "gap",
  ":hover",
  ":focus-visible",
  "z-index",
  "rem",
  "clamp()",
  "aspect-ratio",
  "transition",
  "transform",
  "position: sticky",
  "@keyframes",
  "var(--accent)",
  "overflow: hidden",
  "backdrop-filter",
  // Tailwind
  "tailwind",
  "md:grid-cols-2",
  "rounded-xl",
  // Accessibility & quality
  "aria-label",
  'alt=""',
  'role="dialog"',
  "tabIndex",
  "lazy loading",
  "SEO",
  // Tooling & testing
  "git commit",
  "Docker",
  "Jest",
  "Vitest",
  "expect()",
  "TypeScript",
] as const;

/**
 * Returns a function that yields random items, never repeating an item until at least
 * `minGap` other items have been shown in between.
 */
export function createSnippetPicker<T>(
  items: readonly T[],
  minGap = 30,
  random: () => number = Math.random,
): () => T {
  // A gap equal to the list size would leave nothing to pick.
  const gap = Math.max(0, Math.min(minGap, items.length - 1));
  const recent: T[] = [];

  return () => {
    const blocked = new Set(recent);
    const candidates = items.filter((item) => !blocked.has(item));
    const pick = candidates[Math.floor(random() * candidates.length)];
    recent.push(pick);
    if (recent.length > gap) recent.shift();
    return pick;
  };
}

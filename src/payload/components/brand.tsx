import { LOGO_PATH, LOGO_VIEWBOX } from "@/components/layout/logo-path";

/** The site's FZ monogram (as in its header), in the current text colour. */
export function SiteLogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden className={className ?? "fz-mark"}>
      <path d={LOGO_PATH} fill="currentColor" />
    </svg>
  );
}

/** Login page and loading screen: the monogram with the name, as on the site. */
export function Logo() {
  return (
    <span className="fz-logo">
      <SiteLogoMark className="fz-logo__mark" />
      <span>
        <strong>
          Farid <em>Zeynalov</em>
        </strong>
        <small>Content studio</small>
      </span>
    </span>
  );
}

/** The small mark at the start of the breadcrumb. */
export function Icon() {
  return <SiteLogoMark className="fz-mark" />;
}

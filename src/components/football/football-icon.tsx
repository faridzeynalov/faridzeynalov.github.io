import type { SVGProps } from "react";

/**
 * A classic football (a pentagon in the middle, seams to the edge), drawn like the Lucide
 * icons it sits beside: 24×24, a 2px round stroke in the current colour.
 */
export function FootballIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m12 7.6 4.2 3-1.6 4.9H9.4l-1.6-4.9z" fill="currentColor" fillOpacity={0.18} />
      <path d="M12 7.6V2.3M16.2 10.6l4.9-1.7M14.6 15.5l3 4.2M9.4 15.5l-3 4.2M7.8 10.6 2.9 8.9" />
    </svg>
  );
}

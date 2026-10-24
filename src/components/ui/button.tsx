import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui-style button variants. Apply `buttonVariants()` to `<Link>` / `<a>` for
 * navigational buttons, or use `<Button>` for actions.
 */
export const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-pill text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out-quart select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-fg text-bg shadow-soft hover:bg-fg/90 dev:bg-accent dev:text-accent-fg dev:hover:bg-accent/90 pixel:bg-accent pixel:text-accent-fg pixel:hover:bg-accent/90 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5",
        accent: "bg-accent text-accent-fg shadow-soft hover:brightness-110",
        secondary:
          "border border-border-strong bg-bg-elevated/60 text-fg backdrop-blur hover:border-fg/30 hover:bg-bg-subtle",
        ghost: "text-fg-muted hover:bg-bg-subtle hover:text-fg",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px]",
        md: "h-10 px-5",
        lg: "h-12 px-6 text-[15px]",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonVariantProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

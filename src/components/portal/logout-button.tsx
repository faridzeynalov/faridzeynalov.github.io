import { logout } from "@/app/[locale]/portal/actions";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";

/** Ends the portal session and returns to the sign-in page. */
export function LogoutButton({ locale, label }: { locale: Locale; label: string }) {
  return (
    <form action={logout}>
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className={buttonVariants({ variant: "secondary", size: "sm" })}>
        {label}
      </button>
    </form>
  );
}

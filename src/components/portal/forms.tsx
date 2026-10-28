"use client";

import { useTranslations } from "next-intl";
import { useActionState, type ReactNode } from "react";
import {
  addComment,
  login,
  requestReset,
  setPassword,
  type ActionState,
} from "@/app/[locale]/portal/actions";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAppLocale } from "@/i18n/use-app-locale";
import { cn } from "@/lib/utils";

const idle: ActionState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl border border-border-strong bg-bg px-4 py-3 text-base text-fg outline-none transition-[border-color,box-shadow] placeholder:text-fg-subtle focus:border-accent focus:ring-4 focus:ring-accent-soft";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}

function Message({ tone, children }: { tone: "error" | "ok"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-2xl px-4 py-3 text-sm",
        tone === "error"
          ? "bg-red-500/10 text-red-600 dark:text-red-400"
          : "bg-accent-soft text-fg",
      )}
    >
      {children}
    </p>
  );
}

/** The card the portal's forms sit in. */
export function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-bg-elevated p-6 shadow-soft md:p-8">
      {children}
    </div>
  );
}

export function LoginForm() {
  const t = useTranslations("Portal");
  const locale = useAppLocale();
  const [state, action, pending] = useActionState(login, idle);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <Field label={t("email")}>
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label={t("password")}>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      {state.status === "error" && <Message tone="error">{t("errorLogin")}</Message>}
      {state.status === "invalid" && <Message tone="error">{t("errorInvalid")}</Message>}
      {state.status === "locked" && <Message tone="error">{t("errorLocked")}</Message>}
      <button type="submit" disabled={pending} className={cn(buttonVariants(), "w-full")}>
        {pending ? t("working") : t("signIn")}
      </button>
      <p className="text-center text-sm">
        <Link href="/portal/forgot" className="text-fg-muted underline-offset-4 hover:underline">
          {t("forgot")}
        </Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const t = useTranslations("Portal");
  const locale = useAppLocale();
  const [state, action, pending] = useActionState(requestReset, idle);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <Field label={t("email")}>
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      {state.status === "sent" && <Message tone="ok">{t("sent")}</Message>}
      {state.status === "invalid" && <Message tone="error">{t("errorInvalid")}</Message>}
      <button type="submit" disabled={pending} className={cn(buttonVariants(), "w-full")}>
        {pending ? t("working") : t("sendLink")}
      </button>
      <p className="text-center text-sm">
        <Link href="/portal/login" className="text-fg-muted underline-offset-4 hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}

export function SetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("Portal");
  const locale = useAppLocale();
  const [state, action, pending] = useActionState(setPassword, idle);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <Field label={t("newPassword")}>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
      </Field>
      <Field label={t("confirmPassword")}>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
      </Field>
      {state.status === "invalid" && <Message tone="error">{t("setInvalid")}</Message>}
      {state.status === "error" && (
        <Message tone="error">
          {t("setError")}{" "}
          <Link href="/portal/forgot" className="underline underline-offset-4">
            {t("sendLink")}
          </Link>
        </Message>
      )}
      <button type="submit" disabled={pending} className={cn(buttonVariants(), "w-full")}>
        {pending ? t("working") : t("savePassword")}
      </button>
    </form>
  );
}

export function CommentForm({ project }: { project: number }) {
  const t = useTranslations("Portal");
  const locale = useAppLocale();
  const [state, action, pending] = useActionState(addComment, idle);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="project" value={project} />
      <label className="block">
        <span className="sr-only">{t("commentLabel")}</span>
        <textarea
          name="body"
          required
          maxLength={5000}
          rows={4}
          placeholder={t("commentPlaceholder")}
          className={cn(inputClass, "min-h-28 resize-y leading-relaxed")}
        />
      </label>
      {state.status === "error" && <Message tone="error">{t("commentError")}</Message>}
      {state.status === "invalid" && <Message tone="error">{t("errorInvalid")}</Message>}
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={buttonVariants()}>
          {pending ? t("working") : t("send")}
        </button>
      </div>
    </form>
  );
}

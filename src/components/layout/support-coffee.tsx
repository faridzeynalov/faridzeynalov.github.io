"use client";

import { ArrowUpRight, Coffee, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import qrCode from "@/assets/kofe-qr.png";
import { useSiteOverrides } from "@/lib/site-overrides";

const KOFE_URL = "https://kofe.al/@faridzeynalov";

/** "kofe.al/@faridzeynalov" from the full link. */
const shortLink = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");

/**
 * "Buy me a coffee": a button fixed to the bottom-left corner (the game button sits level with it
 * on the right). It opens a small card with the kofe.al QR code, to scan from another device, and
 * the link itself.
 */
export function SupportCoffee() {
  const t = useTranslations("Support");
  // Link and QR code from the admin's "Sayt ayarları", or the built-in ones.
  const site = useSiteOverrides();
  const kofeUrl = site.kofeUrl ?? KOFE_URL;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cardId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed bottom-6 left-4 z-[45] sm:left-6 print:hidden">
      <AnimatePresence>
        {open && (
          <m.div
            id={cardId}
            role="dialog"
            aria-label={t("open")}
            className="absolute bottom-full left-0 mb-3 w-[min(18rem,calc(100vw-2rem))] origin-bottom-left rounded-2xl border border-border bg-bg-elevated p-4 shadow-float"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-serif text-xl leading-tight text-fg">{t("title")}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-pill text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mt-1 text-sm text-pretty text-fg-muted">{t("text")}</p>
            {/* The code stays black on white in every style and mode, so it always scans. */}
            <div className="mx-auto mt-4 w-44 rounded-xl bg-white p-2">
              <Image
                src={site.kofeQr ?? qrCode}
                alt={t("qr")}
                sizes="176px"
                className="h-auto w-full"
              />
            </div>
            <a
              href={kofeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-1.5 rounded-pill bg-fg px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              {shortLink(kofeUrl)}
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </m.div>
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={open ? cardId : undefined}
        aria-label={t("open")}
        title={t("open")}
        className="flex h-[52px] items-center gap-2 rounded-pill border border-border-strong bg-bg-elevated px-[15px] text-sm font-medium text-fg shadow-float transition-transform duration-300 ease-out-expo hover:-translate-y-0.5"
      >
        <Coffee className="size-[20px] text-accent" aria-hidden />
        <span className="max-sm:hidden">{t("open")}</span>
      </button>
    </div>
  );
}

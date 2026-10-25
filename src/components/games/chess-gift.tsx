"use client";

import { Check, Copy, Crown, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

// Kept out of the message files (which every page ships) and out of plain sight in the code:
// only someone who solves every puzzle is meant to find it.
const SEALED =
  "==Qf9JivQ3L0wCtsQ7L0AGNuQ/L0+CtuQHK0iojIkVWaw92YiwiI0CtvQrL0gwY0CGNsQLL0+CNgRjL0/CtvQrL0hCtI6ISew92YiwiIuwY0BGdtQLY01CttQ/Y0yCdgRDCsQTL0zCtvQrL0gwivQPL01CNI1CtgRjL09C9jRzL0+C9vQPK0g4SuQ7L09CNvQDivQHY0gIY06CdtQ7L0AG9vQDCsQ3L0gUSNgAL06CNtQjL06CdgRDClAKOI8CtvQTL0+CtuQDCvQjL0CGdjRDSgRDiODGNgRPL04CNIwC9tQDiuQ7L0AGNsQTL0+C9vQDSuQ7L0IGNjRvL0+CdsQXL0dCtI6ICd4VGdiwiIhsY09CdtQjY01CNgRDCuQfY0wCNtQDL03CNI1CdgRLJ0iojIlxGdpRnI7pjI1JnIs0nIxSMZuFGbhlHcvtkI6ICZllGcvNmIsISYsFWew92agUHZvtkI6ISew92YiwiIuQXZgQWelFHI1R2brBSYk5WY5FGb4F2cgkZyxFGbPaMIu4WYzJXsE7WY6FWcg0WaylGZuVGIlUDIZmceZmMaplXYsBibplXmJPWmJLntDfGIZmMbtlmbZmcbgEGbk92agUnYgoTmJnXepRWmJjGIrl2pDn2ag4GvDf6w8OMIuFLxfScsETWYul3TiojI0hXZ0JCLiEibpRGdlBCbslZyoBSsELXYsF2Yh1GchRHIux7w0x7wCJiOiUGb0lGdisnOioXYiwSfiQWZpB3bDJiOiQWZpB3bjJCLiUGZvNGI5B3bDJiOikHcvNmIsIiLoNWdvRHIulGI0V2ZgU3b5Biblh2dgQXag42bpRnbl1EIuUWbggGdpdHI0NWZq9mcwBSYgYmZvBSJ1ASdvlHIzVmdpdGIlR2bjBycphGdgozZulWehxGcgI3bmBSdvlXLr5WYoRHIsxWYtNHIBJiOiQHelRnIsISIlxme6VHcgknclZXZgQWZ2x2bzBSdvllI6ISZsRXa0Jye6IiblJCLiUjVPxUQOlVRaRUSSFkRiojIlR2bjJye";

interface Gift {
  code: string;
  [locale: string]: string | { title: string; text: string; copy: string; copied: string };
}

function unseal(): Gift {
  const base64 = SEALED.split("").reverse().join("");
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as Gift;
}

/** The reward for solving every chess puzzle, shown over the board. */
export function ChessGift({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Games");
  const locale = useLocale();
  const [gift] = useState(unseal);
  const text = (gift[locale] ?? gift.en) as Exclude<Gift[string], string>;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(gift.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the code is still there to copy by hand.
    }
  };

  return (
    <div
      className="chess-gift absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg-elevated/95 p-6 text-center backdrop-blur-sm"
      role="status"
    >
      <Crown className="size-9 text-accent" aria-hidden />
      <p className="font-serif text-2xl leading-tight font-semibold text-fg">{text.title}</p>
      <p className="max-w-[18rem] text-sm text-pretty text-fg-muted">{text.text}</p>
      <button
        type="button"
        onClick={copy}
        className="mt-1 inline-flex items-center gap-2.5 rounded-md border-2 border-dashed border-accent px-4 py-2.5 font-mono text-lg tracking-wider text-fg transition-colors hover:bg-accent-soft"
      >
        {gift.code}
        {copied ? (
          <Check className="size-4 text-accent" aria-hidden />
        ) : (
          <Copy className="size-4 text-fg-subtle" aria-hidden />
        )}
        <span className="sr-only">{copied ? text.copied : text.copy}</span>
      </button>
      <p className="h-4 text-xs text-accent" aria-live="polite">
        {copied ? text.copied : ""}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-pill text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

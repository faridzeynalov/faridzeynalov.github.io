"use client";

import {
  Code2,
  Database,
  Globe,
  Palette,
  Search,
  Smartphone,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GameBar, useBest } from "@/components/games/game-ui";
import { cn } from "@/lib/utils";

/** The pairs: what goes into a front-end project. */
const ICONS: LucideIcon[] = [Code2, Palette, Zap, Search, Smartphone, Database, Sparkles, Globe];

function shuffledDeck() {
  const deck = [...ICONS.keys(), ...ICONS.keys()];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Classic style: a memory game. Turn two cards at a time and find all eight pairs. */
export default function MemoryGame() {
  const t = useTranslations("Games");
  const [deck, setDeck] = useState(shuffledDeck);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [best, saveBest] = useBest("memory", "low");
  const won = found.size === ICONS.length;

  // Two different cards stay face up for a moment, then turn back.
  useEffect(() => {
    if (open.length !== 2) return;
    const timer = window.setTimeout(() => setOpen([]), 750);
    return () => window.clearTimeout(timer);
  }, [open]);

  const flip = (index: number) => {
    if (open.length === 2 || open.includes(index) || found.has(deck[index])) return;
    const next = [...open, index];
    if (next.length < 2) {
      setOpen(next);
      return;
    }
    const count = moves + 1;
    setMoves(count);
    if (deck[next[0]] === deck[next[1]]) {
      const pairs = new Set(found).add(deck[index]);
      setFound(pairs);
      setOpen([]);
      if (pairs.size === ICONS.length) saveBest(count);
    } else {
      setOpen(next);
    }
  };

  const restart = () => {
    setDeck(shuffledDeck());
    setOpen([]);
    setFound(new Set());
    setMoves(0);
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2.5 [perspective:800px]">
        {deck.map((icon, index) => {
          const Icon = ICONS[icon];
          const up = open.includes(index) || found.has(icon);
          return (
            <button
              key={index}
              type="button"
              onClick={() => flip(index)}
              aria-label={up ? t("memory.card", { n: icon + 1 }) : t("memory.hidden")}
              className="relative aspect-square transition-transform duration-500 ease-out-expo [transform-style:preserve-3d]"
              style={{ transform: up ? "rotateY(180deg)" : undefined }}
            >
              <span className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-bg-subtle [backface-visibility:hidden]">
                <span className="size-2 rounded-full bg-border-strong" />
              </span>
              <span
                className={cn(
                  "absolute inset-0 flex [transform:rotateY(180deg)] items-center justify-center rounded-xl border [backface-visibility:hidden]",
                  found.has(icon)
                    ? "border-accent/40 bg-accent-soft text-accent"
                    : "border-border-strong bg-bg text-fg",
                )}
              >
                <Icon className="size-6" aria-hidden />
              </span>
            </button>
          );
        })}
      </div>
      <GameBar
        status={won ? t("memory.won", { moves }) : t("moves", { n: moves })}
        best={best === null ? null : t("bestMoves", { n: best })}
        onRestart={restart}
      />
    </div>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A file name for the Developer style's card title bars, from an English title:
 * "Languages & markup" → "languages-markup.ts". Pass the English text so names stay the same
 * in every language, like real file names.
 */
export function toFileName(title: string, extension: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}.${extension}`;
}

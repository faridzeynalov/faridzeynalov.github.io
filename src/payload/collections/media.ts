import type { CollectionConfig } from "payload";
import { groups, l } from "@/payload/fields";

/** Images and files (project screenshots, share images, the CV), stored in Vercel Blob. */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: l("Fayl", "File", "Файл"), plural: l("Media", "Media", "Медиа") },
  admin: { group: groups.system },
  access: { read: () => true },
  upload: { mimeTypes: ["image/*", "application/pdf"] },
  fields: [
    {
      name: "alt",
      label: l("Alternativ mətn", "Alt text", "Альтернативный текст"),
      type: "text",
      localized: true,
    },
  ],
};

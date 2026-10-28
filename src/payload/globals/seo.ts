import type { Field, GlobalConfig } from "payload";
import { revalidateSite } from "@/payload/hooks/revalidate-site";

/** Pages whose search-engine title and description can be set from the admin panel. */
export const seoPages = ["home", "portfolio", "services", "about", "contact", "cv"] as const;
export type SeoPage = (typeof seoPages)[number];

const pageLabels: Record<SeoPage, string> = {
  home: "Ana səhifə",
  portfolio: "Portfolio",
  services: "Xidmətlər",
  about: "Haqqımda",
  contact: "Əlaqə",
  cv: "CV",
};

const titleAndDescription: Field[] = [
  {
    name: "title",
    label: "Başlıq (title)",
    type: "text",
    localized: true,
    admin: { description: "Google-da göstərilən başlıq. Təxminən 60 simvol." },
  },
  {
    name: "description",
    label: "Təsvir (meta description)",
    type: "textarea",
    localized: true,
    admin: { description: "Axtarış nəticəsində başlığın altındakı mətn. Təxminən 160 simvol." },
  },
];

/**
 * Titles, descriptions and keywords per page and language. An empty field keeps the text built
 * into the site, so only what you fill in here changes.
 */
export const Seo: GlobalConfig = {
  slug: "seo",
  label: "SEO",
  admin: { group: "Ayarlar" },
  access: { read: () => true },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Ümumi",
          fields: [
            {
              name: "keywords",
              label: "Açar sözlər",
              type: "textarea",
              localized: true,
              admin: { description: "Vergüllə ayırın: sayt hazırlanması, sayt düzəltmək, …" },
            },
            {
              name: "ogImage",
              label: "Paylaşım şəkli (1200×630)",
              type: "upload",
              relationTo: "media",
            },
          ],
        },
        ...seoPages.map((page) => ({
          label: pageLabels[page],
          fields: [
            {
              name: page,
              type: "group" as const,
              label: false as const,
              fields: titleAndDescription,
            },
          ],
        })),
      ],
    },
  ],
};

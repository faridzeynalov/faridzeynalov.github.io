import type { Field, GlobalConfig } from "payload";
import { anyone, isAdmin } from "@/payload/access";
import { groups, i18nField, l, type Label } from "@/payload/fields";
import { revalidateSite } from "@/payload/hooks/revalidate-site";

/** Pages whose search-engine title and description can be set from the admin panel. */
export const seoPages = ["home", "portfolio", "services", "about", "contact", "cv"] as const;
export type SeoPage = (typeof seoPages)[number];

export const pageLabels: Record<SeoPage, Label> = {
  home: l("Ana səhifə", "Home", "Главная"),
  portfolio: l("Portfolio", "Portfolio", "Портфолио"),
  services: l("Xidmətlər", "Services", "Услуги"),
  about: l("Haqqımda", "About", "Обо мне"),
  contact: l("Əlaqə", "Contact", "Контакты"),
  cv: l("CV", "CV", "Резюме"),
};

const titleAndDescription: Field[] = [
  i18nField("title", l("Başlıq (title)", "Title", "Заголовок (title)"), {
    description: l(
      "Google-da göstərilən başlıq. Təxminən 60 simvol.",
      "The title shown in Google. About 60 characters.",
      "Заголовок в Google. Около 60 символов.",
    ),
  }),
  i18nField(
    "description",
    l("Təsvir (meta description)", "Meta description", "Описание (meta description)"),
    {
      long: true,
      description: l(
        "Axtarış nəticəsində başlığın altındakı mətn. Təxminən 160 simvol.",
        "The text under the title in search results. About 160 characters.",
        "Текст под заголовком в результатах поиска. Около 160 символов.",
      ),
    },
  ),
];

/**
 * Titles, descriptions and keywords per page and language. An empty field keeps the text built
 * into the site, so only what you fill in here changes.
 */
export const Seo: GlobalConfig = {
  slug: "seo",
  label: l("SEO", "SEO", "SEO"),
  admin: {
    group: groups.settings,
    description: l(
      "Boş sahələr saytdakı indiki mətni saxlayır.",
      "Empty fields keep the text currently on the site.",
      "Пустые поля сохраняют текущий текст сайта.",
    ),
  },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: l("Ümumi", "General", "Общее"),
          fields: [
            i18nField("keywords", l("Açar sözlər", "Keywords", "Ключевые слова"), {
              long: true,
              description: l(
                "Vergüllə ayırın: sayt hazırlanması, sayt düzəltmək, …",
                "Separate with commas: website development, web design, …",
                "Через запятую: создание сайтов, веб-дизайн, …",
              ),
            }),
            {
              name: "ogImage",
              label: l(
                "Paylaşım şəkli (1200×630)",
                "Share image (1200×630)",
                "Изображение для соцсетей (1200×630)",
              ),
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

import type { CheckboxField, GlobalConfig } from "payload";
import { anyone, isAdmin } from "@/payload/access";
import { groups, l, type Label } from "@/payload/fields";
import { pageLabels } from "@/payload/globals/seo";
import { revalidateSite } from "@/payload/hooks/revalidate-site";

/** Pages that can be switched off (the home page always stays). */
export const switchablePages = ["portfolio", "services", "about", "contact", "cv"] as const;
export type SwitchablePage = (typeof switchablePages)[number];

/** Home page sections that can be hidden (the intro always stays). */
export const homeSections = [
  "marquee",
  "selectedWork",
  "services",
  "skills",
  "ai",
  "experience",
  "about",
  "contact",
] as const;
export type HomeSection = (typeof homeSections)[number];

const sectionLabels: Record<HomeSection, Label> = {
  marquee: l("Domen lenti", "Domain ticker", "Лента доменов"),
  selectedWork: l("Seçilmiş işlər", "Selected work", "Избранные работы"),
  services: l("Xidmətlər", "Services", "Услуги"),
  skills: l("Bacarıqlar", "Skills", "Навыки"),
  ai: l("Süni intellekt", "AI", "ИИ"),
  experience: l("Təcrübə", "Experience", "Опыт"),
  about: l("Haqqımda", "About", "Обо мне"),
  contact: l("Əlaqə çağırışı", "Contact call-to-action", "Призыв связаться"),
};

const switchField = (name: string, label: Label): CheckboxField => ({
  name,
  label,
  type: "checkbox",
  defaultValue: true,
});

/** Which pages and home sections are shown. A page switched off disappears from menus too. */
export const Pages: GlobalConfig = {
  slug: "pages",
  label: l("Səhifələr", "Pages", "Страницы"),
  admin: {
    group: groups.settings,
    description: l(
      "Söndürülən səhifə menyudan və sitemap-dən çıxır, ünvanı isə 404 verir.",
      "A page switched off leaves the menus and the sitemap, and its address returns 404.",
      "Отключённая страница пропадает из меню и sitemap, а её адрес возвращает 404.",
    ),
  },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      name: "pages",
      label: l("Səhifələr", "Pages", "Страницы"),
      type: "group",
      fields: [
        {
          type: "row",
          fields: switchablePages.map((page) => switchField(page, pageLabels[page])),
        },
      ],
    },
    {
      name: "home",
      label: l("Ana səhifənin bölmələri", "Home page sections", "Разделы главной"),
      type: "group",
      fields: [
        {
          type: "row",
          fields: homeSections.map((section) => switchField(section, sectionLabels[section])),
        },
      ],
    },
  ],
};

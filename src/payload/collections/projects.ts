import type { CollectionConfig } from "payload";
import {
  activeField,
  groups,
  i18nField,
  i18nLinesField,
  l,
  linesField,
  toggleField,
} from "@/payload/fields";
import { revalidateAfterChange, revalidateAfterDelete } from "@/payload/hooks/revalidate-site";

/**
 * Portfolio projects, in the order shown on the site (drag to reorder). Screenshots left empty
 * keep the built-in captures for that slug.
 */
export const Projects: CollectionConfig = {
  slug: "projects",
  labels: {
    singular: l("Layihə", "Project", "Проект"),
    plural: l("Portfolio", "Portfolio", "Портфолио"),
  },
  orderable: true,
  admin: {
    group: groups.content,
    useAsTitle: "name",
    defaultColumns: ["name", "domain", "industry", "active", "featured"],
    listSearchableFields: ["name", "domain", "slug"],
    description: l(
      "Sıranı dəyişmək üçün sətirləri sürüşdürün. Şəkil yükləməsəniz, mövcud ekran görüntüləri qalır.",
      "Drag the rows to change the order. Without uploaded screenshots, the existing captures stay.",
      "Перетащите строки, чтобы изменить порядок. Без загруженных скриншотов остаются текущие.",
    ),
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: l("Əsas", "Main", "Основное"),
          fields: [
            {
              type: "row",
              fields: [
                { name: "name", label: l("Ad", "Name", "Название"), type: "text", required: true },
                {
                  name: "slug",
                  label: l("Slug (ünvan)", "Slug (address)", "Slug (адрес)"),
                  type: "text",
                  required: true,
                  unique: true,
                  index: true,
                  admin: {
                    description: l(
                      "/portfolio/<slug>; latın hərfləri və defis.",
                      "/portfolio/<slug>; Latin letters and hyphens.",
                      "/portfolio/<slug>; латинские буквы и дефисы.",
                    ),
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "domain",
                  label: l("Domen", "Domain", "Домен"),
                  type: "text",
                  required: true,
                },
                {
                  name: "url",
                  label: l("Link", "Link", "Ссылка"),
                  type: "text",
                  required: true,
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "industry",
                  label: l("Sahə", "Industry", "Отрасль"),
                  type: "select",
                  required: true,
                  options: [
                    {
                      label: l("Otel və kurortlar", "Hotels & resorts", "Отели и курорты"),
                      value: "hospitality",
                    },
                    {
                      label: l("Daşınmaz əmlak", "Real estate", "Недвижимость"),
                      value: "real-estate",
                    },
                    { label: l("Səhiyyə", "Healthcare", "Медицина"), value: "healthcare" },
                    {
                      label: l("E-ticarət", "E-commerce", "Электронная коммерция"),
                      value: "e-commerce",
                    },
                    { label: l("Korporativ", "Corporate", "Корпоративный"), value: "corporate" },
                    { label: l("Təhsil", "Education", "Образование"), value: "education" },
                  ],
                },
                {
                  name: "group",
                  label: l("Brend qrupu", "Brand group", "Группа брендов"),
                  type: "text",
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "languages",
                  label: l("Saytın dilləri", "Site languages", "Языки сайта"),
                  type: "select",
                  hasMany: true,
                  options: [
                    { label: "AZ", value: "az" },
                    { label: "EN", value: "en" },
                    { label: "RU", value: "ru" },
                  ],
                },
                {
                  name: "accent",
                  label: l("Rəng", "Accent colour", "Цвет"),
                  type: "text",
                  defaultValue: "#888888",
                  admin: { description: l("Məsələn #2b3a5c", "E.g. #2b3a5c", "Например #2b3a5c") },
                },
              ],
            },
            linesField("stack", l("Texnologiyalar", "Technologies", "Технологии")),
          ],
        },
        {
          label: l("Mətn", "Text", "Текст"),
          fields: [
            i18nField("summary", l("Qısa təsvir", "Summary", "Краткое описание"), {
              long: true,
            }),
            i18nField("overview", l("Ətraflı təsvir", "Overview", "Подробное описание"), {
              long: true,
            }),
            i18nLinesField(
              "liveFeatures",
              l("Saytdakı funksiyalar", "Features on the live site", "Функции на сайте"),
            ),
            i18nField("note", l("Qeyd", "Note", "Примечание"), { long: true }),
            i18nField(
              "unavailableReason",
              l("Önizləmə niyə yoxdur", "Why there is no preview", "Почему нет превью"),
              { long: true },
            ),
          ],
        },
        {
          label: l("Şəkillər", "Screenshots", "Скриншоты"),
          name: "images",
          fields: [
            {
              name: "cover",
              label: l("Kompüter (1440×900)", "Desktop (1440×900)", "Компьютер (1440×900)"),
              type: "upload",
              relationTo: "media",
            },
            {
              name: "thumb",
              label: l("Kart üçün kiçik", "Card thumbnail", "Миниатюра для карточки"),
              type: "upload",
              relationTo: "media",
            },
            {
              name: "mobile",
              label: l("Mobil (390×844)", "Mobile (390×844)", "Мобильный (390×844)"),
              type: "upload",
              relationTo: "media",
            },
            {
              name: "section",
              label: l("Əlavə bölmə", "Extra section", "Дополнительный раздел"),
              type: "upload",
              relationTo: "media",
            },
          ],
        },
      ],
    },
    activeField(),
    toggleField(
      "featured",
      l("Ana səhifədə göstər", "Show on the home page", "Показывать на главной"),
      false,
    ),
  ],
};

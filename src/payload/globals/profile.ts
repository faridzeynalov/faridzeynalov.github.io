import type { ArrayField, GlobalConfig } from "payload";
import { groups, l, linesField, rowActiveField, type Label } from "@/payload/fields";
import { revalidateSite } from "@/payload/hooks/revalidate-site";

const rowLabel = { RowLabel: "/payload/components/row-label#RowLabel" };

function list(
  name: string,
  label: Label,
  singular: Label,
  fields: ArrayField["fields"],
): ArrayField {
  return {
    name,
    label,
    labels: { singular, plural: label },
    type: "array",
    admin: { initCollapsed: true, components: rowLabel },
    fields: [...fields, rowActiveField],
  };
}

const text = (name: string, label: Label) => ({
  name,
  label,
  type: "text" as const,
  localized: true,
});
const textarea = (name: string, label: Label) => ({
  name,
  label,
  type: "textarea" as const,
  localized: true,
});

/**
 * Everything about me: the summary and About text, skills, experience, education, languages,
 * certificates and the names of the industries I've worked in. A list left empty keeps the
 * built-in content.
 */
export const Profile: GlobalConfig = {
  slug: "profile",
  label: l("Profil", "Profile", "Профиль"),
  admin: {
    group: groups.content,
    description: l(
      "Haqqımda, CV və ana səhifədəki şəxsi məlumatlar. Boş siyahı saytdakı indiki məzmunu saxlayır.",
      "About, CV and the personal sections of the home page. An empty list keeps the content currently on the site.",
      "Обо мне, резюме и личные разделы главной. Пустой список сохраняет текущий контент сайта.",
    ),
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: l("Ümumi", "General", "Общее"),
          fields: [
            textarea("summary", l("Qısa xülasə", "Summary", "Краткое резюме")),
            {
              type: "row",
              fields: [
                text("cvTitle", l("CV başlığı", "CV title", "Заголовок резюме")),
                text(
                  "present",
                  l("“İndiyədək” sözü", "Word for “present”", "Слово «по настоящее время»"),
                ),
              ],
            },
            textarea("cvSummary", l("CV xülasəsi", "CV summary", "Описание в резюме")),
            linesField(
              "industries",
              l("CV-dəki sahələr", "Industries in the CV", "Отрасли в резюме"),
            ),
          ],
        },
        {
          label: l("Haqqımda", "About", "Обо мне"),
          fields: [
            list(
              "about",
              l("Haqqımda mətni", "About text", "Текст «Обо мне»"),
              l("Abzas", "Paragraph", "Абзац"),
              [textarea("text", l("Mətn", "Text", "Текст"))],
            ),
            list(
              "principles",
              l("Prinsiplər", "Principles", "Принципы"),
              l("Prinsip", "Principle", "Принцип"),
              [
                text("title", l("Başlıq", "Title", "Заголовок")),
                textarea("text", l("Mətn", "Text", "Текст")),
              ],
            ),
          ],
        },
        {
          label: l("Bacarıqlar", "Skills", "Навыки"),
          fields: [
            list("skills", l("Bacarıqlar", "Skills", "Навыки"), l("Qrup", "Group", "Группа"), [
              text("title", l("Ad", "Name", "Название")),
              textarea("description", l("Təsvir", "Description", "Описание")),
              linesField("items", l("Bacarıqlar", "Skills", "Навыки")),
            ]),
          ],
        },
        {
          label: l("Təcrübə", "Experience", "Опыт"),
          fields: [
            list(
              "experience",
              l("İş təcrübəsi", "Work experience", "Опыт работы"),
              l("İş", "Job", "Работа"),
              [
                {
                  type: "row",
                  fields: [
                    text("role", l("Vəzifə", "Role", "Должность")),
                    {
                      name: "company",
                      label: l("Şirkət", "Company", "Компания"),
                      type: "text",
                    },
                    {
                      name: "companyUrl",
                      label: l("Şirkətin saytı", "Company website", "Сайт компании"),
                      type: "text",
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    text("location", l("Yer", "Location", "Место")),
                    {
                      name: "start",
                      label: l("Başlanğıc (AA/İİİİ)", "Start (MM/YYYY)", "Начало (ММ/ГГГГ)"),
                      type: "text",
                    },
                    {
                      name: "end",
                      label: l(
                        "Son (boş = indiyədək)",
                        "End (empty = present)",
                        "Конец (пусто = сейчас)",
                      ),
                      type: "text",
                    },
                  ],
                },
                linesField("highlights", l("Nailiyyətlər", "Highlights", "Достижения")),
              ],
            ),
          ],
        },
        {
          label: l("Təhsil və dillər", "Education & languages", "Образование и языки"),
          fields: [
            list(
              "education",
              l("Təhsil", "Education", "Образование"),
              l("Təhsil", "Education", "Образование"),
              [
                {
                  type: "row",
                  fields: [
                    text("degree", l("Dərəcə", "Degree", "Степень")),
                    text("field", l("İxtisas", "Field", "Специальность")),
                  ],
                },
                text("institution", l("Təhsil müəssisəsi", "Institution", "Учебное заведение")),
                {
                  type: "row",
                  fields: [
                    { name: "start", label: l("Başlanğıc", "Start", "Начало"), type: "text" },
                    { name: "end", label: l("Son", "End", "Конец"), type: "text" },
                  ],
                },
              ],
            ),
            list("languages", l("Dillər", "Languages", "Языки"), l("Dil", "Language", "Язык"), [
              {
                type: "row",
                fields: [
                  text("name", l("Dil", "Language", "Язык")),
                  text("level", l("Səviyyə", "Level", "Уровень")),
                ],
              },
            ]),
            list(
              "certificates",
              l("Sertifikatlar", "Certificates", "Сертификаты"),
              l("Sertifikat", "Certificate", "Сертификат"),
              [
                {
                  type: "row",
                  fields: [
                    text("name", l("Ad", "Name", "Название")),
                    text("period", l("Dövr", "Period", "Период")),
                  ],
                },
              ],
            ),
          ],
        },
        {
          label: l("Sahə adları", "Industry names", "Названия отраслей"),
          fields: [
            {
              name: "industryNames",
              type: "group",
              label: false,
              admin: {
                description: l(
                  "Portfolio filtrlərində və layihə kartlarında görünən adlar.",
                  "Names shown in the portfolio filters and on project cards.",
                  "Названия в фильтрах портфолио и на карточках проектов.",
                ),
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    text(
                      "hospitality",
                      l("Otel və kurortlar", "Hotels & resorts", "Отели и курорты"),
                    ),
                    text("realEstate", l("Daşınmaz əmlak", "Real estate", "Недвижимость")),
                    text("healthcare", l("Səhiyyə", "Healthcare", "Медицина")),
                  ],
                },
                {
                  type: "row",
                  fields: [
                    text("eCommerce", l("E-ticarət", "E-commerce", "Электронная коммерция")),
                    text("corporate", l("Korporativ", "Corporate", "Корпоративный")),
                    text("education", l("Təhsil", "Education", "Образование")),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

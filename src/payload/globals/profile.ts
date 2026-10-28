import type { ArrayField, GlobalConfig } from "payload";
import { groups, i18nField, i18nLinesField, l, rowActiveField, type Label } from "@/payload/fields";
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

/** A short text the same in every language (dates, a company name, a link). */
const plain = (name: string, label: Label) => ({ name, label, type: "text" as const });

/**
 * Everything about me: the summary and About text, skills, experience, education, languages,
 * certificates and the names of the industries I've worked in, each text in all three
 * languages. A list left empty keeps the built-in content.
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
            i18nField("summary", l("Qısa xülasə", "Summary", "Краткое резюме"), { long: true }),
            i18nField("cvTitle", l("CV başlığı", "CV title", "Заголовок резюме")),
            i18nField("cvSummary", l("CV xülasəsi", "CV summary", "Описание в резюме"), {
              long: true,
            }),
            i18nField(
              "present",
              l("“İndiyədək” sözü", "Word for “present”", "Слово «по настоящее время»"),
            ),
            i18nLinesField(
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
              [i18nField("text", l("Mətn", "Text", "Текст"), { long: true })],
            ),
            list(
              "principles",
              l("Prinsiplər", "Principles", "Принципы"),
              l("Prinsip", "Principle", "Принцип"),
              [
                i18nField("title", l("Başlıq", "Title", "Заголовок")),
                i18nField("text", l("Mətn", "Text", "Текст"), { long: true }),
              ],
            ),
          ],
        },
        {
          label: l("Bacarıqlar", "Skills", "Навыки"),
          fields: [
            list("skills", l("Bacarıqlar", "Skills", "Навыки"), l("Qrup", "Group", "Группа"), [
              i18nField("title", l("Ad", "Name", "Название")),
              i18nField("description", l("Təsvir", "Description", "Описание"), { long: true }),
              i18nLinesField("items", l("Bacarıqlar", "Skills", "Навыки")),
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
                i18nField("role", l("Vəzifə", "Role", "Должность")),
                {
                  type: "row",
                  fields: [
                    plain("company", l("Şirkət", "Company", "Компания")),
                    plain("companyUrl", l("Şirkətin saytı", "Company website", "Сайт компании")),
                  ],
                },
                i18nField("location", l("Yer", "Location", "Место")),
                {
                  type: "row",
                  fields: [
                    plain("start", l("Başlanğıc (AA/İİİİ)", "Start (MM/YYYY)", "Начало (ММ/ГГГГ)")),
                    plain(
                      "end",
                      l("Son (boş = indiyədək)", "End (empty = present)", "Конец (пусто = сейчас)"),
                    ),
                  ],
                },
                i18nLinesField("highlights", l("Nailiyyətlər", "Highlights", "Достижения")),
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
                i18nField("degree", l("Dərəcə", "Degree", "Степень")),
                i18nField("field", l("İxtisas", "Field", "Специальность")),
                i18nField(
                  "institution",
                  l("Təhsil müəssisəsi", "Institution", "Учебное заведение"),
                ),
                {
                  type: "row",
                  fields: [
                    plain("start", l("Başlanğıc", "Start", "Начало")),
                    plain("end", l("Son", "End", "Конец")),
                  ],
                },
              ],
            ),
            list("languages", l("Dillər", "Languages", "Языки"), l("Dil", "Language", "Язык"), [
              i18nField("name", l("Dil", "Language", "Язык")),
              i18nField("level", l("Səviyyə", "Level", "Уровень")),
            ]),
            list(
              "certificates",
              l("Sertifikatlar", "Certificates", "Сертификаты"),
              l("Sertifikat", "Certificate", "Сертификат"),
              [
                i18nField("name", l("Ad", "Name", "Название")),
                i18nField("period", l("Dövr", "Period", "Период")),
              ],
            ),
          ],
        },
        {
          label: l("Sahə adları", "Industry names", "Названия отраслей"),
          description: l(
            "Portfolio filtrlərində və layihə kartlarında görünən adlar.",
            "Names shown in the portfolio filters and on project cards.",
            "Названия в фильтрах портфолио и на карточках проектов.",
          ),
          fields: [
            {
              name: "industryNames",
              type: "group",
              label: false,
              fields: [
                i18nField(
                  "hospitality",
                  l("Otel və kurortlar", "Hotels & resorts", "Отели и курорты"),
                ),
                i18nField("realEstate", l("Daşınmaz əmlak", "Real estate", "Недвижимость")),
                i18nField("healthcare", l("Səhiyyə", "Healthcare", "Медицина")),
                i18nField("eCommerce", l("E-ticarət", "E-commerce", "Электронная коммерция")),
                i18nField("corporate", l("Korporativ", "Corporate", "Корпоративный")),
                i18nField("education", l("Təhsil", "Education", "Образование")),
              ],
            },
          ],
        },
      ],
    },
  ],
};

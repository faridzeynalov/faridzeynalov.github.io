import type { Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { siteUrl } from "@/lib/site";

/** Emails to portal clients and to me, in the client's language, in the site's colours. */

export const portalUrl = (locale: Locale, path = "") =>
  `${siteUrl}${localizedPath(locale, `/portal${path}`)}`;

const escape = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** A short, plain HTML email: heading, a paragraph or two and one button. */
export function emailLayout({
  heading,
  paragraphs,
  button,
  footer,
}: {
  heading: string;
  paragraphs: string[];
  button?: { label: string; href: string };
  footer: string;
}) {
  return `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#f7f6f3;font-family:Helvetica,Arial,sans-serif;color:#111113">
<table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e7e5df;border-radius:16px">
<tr><td style="padding:32px">
<p style="margin:0 0 24px;font-weight:700;font-size:15px">Farid <span style="color:#c2410c;font-style:italic;font-family:Georgia,serif;font-weight:400">Zeynalov</span></p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${escape(heading)}</h1>
${paragraphs.map((text) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4f4f57">${escape(text)}</p>`).join("")}
${
  button
    ? `<p style="margin:24px 0 0"><a href="${button.href}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#111113;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px">${escape(button.label)}</a></p>`
    : ""
}
</td></tr></table>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#6c6c75;text-align:center">${escape(footer)}</p>
</body></html>`;
}

const footers: Record<Locale, string> = {
  az: "Bu məktub faridzeynalov.com müştəri portalından göndərilib.",
  en: "This email was sent by the client portal at faridzeynalov.com.",
  ru: "Это письмо отправлено клиентским порталом faridzeynalov.com.",
};

/** Invitation (a new client) or password reset (an existing one), with the set-password link. */
export function passwordEmail({
  locale,
  name,
  token,
  invite,
}: {
  locale: Locale;
  name?: string | null;
  token: string;
  invite: boolean;
}) {
  const href = portalUrl(locale, `/set-password?token=${encodeURIComponent(token)}`);
  const hello =
    { az: "Salam", en: "Hello", ru: "Здравствуйте" }[locale] + (name ? `, ${name}` : "");
  const copy = invite
    ? {
        az: {
          subject: "Layihə portalına dəvət",
          heading: `${hello}!`,
          text: [
            "Sizi layihənizin portalına dəvət edirəm. Orada işin hansı mərhələdə olduğunu görə və şərhlərinizi yaza bilərsiniz.",
            "Başlamaq üçün şifrənizi təyin edin. Link 7 gün etibarlıdır.",
          ],
          button: "Şifrəni təyin et",
        },
        en: {
          subject: "Your invitation to the project portal",
          heading: `${hello}!`,
          text: [
            "I'm inviting you to your project's portal, where you can see which stage the work is at and leave your comments.",
            "Set your password to get started. The link is valid for 7 days.",
          ],
          button: "Set your password",
        },
        ru: {
          subject: "Приглашение на портал проекта",
          heading: `${hello}!`,
          text: [
            "Приглашаю вас на портал вашего проекта: там видно, на каком этапе работа, и можно оставлять комментарии.",
            "Чтобы начать, задайте пароль. Ссылка действует 7 дней.",
          ],
          button: "Задать пароль",
        },
      }[locale]
    : {
        az: {
          subject: "Şifrənin bərpası",
          heading: `${hello}!`,
          text: [
            "Portal üçün yeni şifrə istədiniz. Aşağıdakı linklə yeni şifrə təyin edin. Link 1 saat etibarlıdır.",
            "Bunu siz istəməmisinizsə, bu məktubu nəzərə almayın.",
          ],
          button: "Yeni şifrə təyin et",
        },
        en: {
          subject: "Reset your password",
          heading: `${hello}!`,
          text: [
            "You asked for a new portal password. Use the link below to set one. It is valid for 1 hour.",
            "If you didn't ask for this, you can ignore this email.",
          ],
          button: "Set a new password",
        },
        ru: {
          subject: "Восстановление пароля",
          heading: `${hello}!`,
          text: [
            "Вы запросили новый пароль для портала. Задайте его по ссылке ниже. Она действует 1 час.",
            "Если вы этого не запрашивали, просто проигнорируйте письмо.",
          ],
          button: "Задать новый пароль",
        },
      }[locale];
  return {
    subject: copy.subject,
    html: emailLayout({
      heading: copy.heading,
      paragraphs: copy.text,
      button: { label: copy.button, href },
      footer: footers[locale],
    }),
  };
}

/** A new comment on a project: to the client (from me) or to me (from the client). */
export function commentEmail({
  locale,
  projectTitle,
  author,
  body,
  href,
}: {
  locale: Locale;
  projectTitle: string;
  author: string;
  body: string;
  href: string;
}) {
  const copy = {
    az: {
      subject: `Yeni şərh: ${projectTitle}`,
      heading: `${author} şərh yazdı`,
      button: "Şərhə bax",
    },
    en: {
      subject: `New comment: ${projectTitle}`,
      heading: `${author} left a comment`,
      button: "View the comment",
    },
    ru: {
      subject: `Новый комментарий: ${projectTitle}`,
      heading: `${author} оставил(а) комментарий`,
      button: "Открыть комментарий",
    },
  }[locale];
  const excerpt = body.length > 400 ? `${body.slice(0, 400)}…` : body;
  return {
    subject: copy.subject,
    html: emailLayout({
      heading: copy.heading,
      paragraphs: [projectTitle, `“${excerpt}”`],
      button: { label: copy.button, href },
      footer: footers[locale],
    }),
  };
}

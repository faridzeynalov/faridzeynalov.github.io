import crypto from "node:crypto";
import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from "payload";
import { isAdmin } from "@/payload/access";
import { passwordEmail } from "@/payload/email";
import { l } from "@/payload/fields";
import type { Locale } from "@/i18n/routing";

/** How long an invitation link stays valid (a password reset keeps Payload's 1 hour). */
export const INVITE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

/**
 * A client added in the admin gets a random password nobody knows, so the account exists before
 * they've chosen their own; the invitation lets them set it.
 */
const placeholderPassword: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (operation !== "create" || !data || data.password) return data;
  return { ...data, password: crypto.randomBytes(24).toString("base64url") };
};

/** Sends the invitation (a set-password link) when a client is added. */
const sendInvitation: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== "create" || req.context?.skipInvite) return doc;
  await req.payload.forgotPassword({
    collection: "clients",
    data: { email: doc.email },
    expiration: INVITE_EXPIRATION,
    context: { invite: true },
    req,
  });
  return doc;
};

/**
 * People I'm working with: they sign in to the portal (/portal) to follow their projects and
 * comment. Invitation only: an admin adds them here and they get an email to set a password.
 */
export const Clients: CollectionConfig = {
  slug: "clients",
  labels: {
    singular: l("Müştəri", "Client", "Клиент"),
    plural: l("Müştərilər", "Clients", "Клиенты"),
  },
  admin: {
    group: l("Müştəri portalı", "Client portal", "Клиентский портал"),
    useAsTitle: "name",
    defaultColumns: ["name", "email", "company", "language"],
    description: l(
      "Müştərini əlavə edəndə ona portala dəvət məktubu gedir: şifrəsini özü təyin edir.",
      "Adding a client emails them an invitation to the portal, where they set their own password.",
      "При добавлении клиенту приходит приглашение на портал, где он сам задаёт пароль.",
    ),
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 14,
    maxLoginAttempts: 8,
    lockTime: 15 * 60 * 1000,
    cookies: { sameSite: "Lax" },
    forgotPassword: {
      generateEmailSubject: ({ req, user } = {}) =>
        passwordEmail({
          locale: (user?.language ?? "az") as Locale,
          name: user?.name,
          token: "",
          invite: Boolean(req?.context?.invite),
        }).subject,
      generateEmailHTML: ({ req, token, user } = {}) =>
        passwordEmail({
          locale: (user?.language ?? "az") as Locale,
          name: user?.name,
          token: token ?? "",
          invite: Boolean(req?.context?.invite),
        }).html,
    },
  },
  access: {
    // A client reads and edits only their own account; admins see everyone.
    read: ({ req }) =>
      req.user?.collection === "users" ||
      (req.user?.collection === "clients" ? { id: { equals: req.user.id } } : false),
    update: ({ req }) =>
      req.user?.collection === "users" ||
      (req.user?.collection === "clients" ? { id: { equals: req.user.id } } : false),
    create: isAdmin,
    delete: isAdmin,
    // The admin panel is for admins only, whatever a client's account allows.
    admin: () => false,
  },
  hooks: {
    beforeValidate: [placeholderPassword],
    afterChange: [sendInvitation],
  },
  fields: [
    {
      name: "name",
      label: l("Ad Soyad", "Full name", "Имя и фамилия"),
      type: "text",
      required: true,
    },
    { name: "company", label: l("Şirkət", "Company", "Компания"), type: "text" },
    {
      name: "language",
      label: l("Dil", "Language", "Язык"),
      type: "select",
      required: true,
      defaultValue: "az",
      options: [
        { label: "Azərbaycanca", value: "az" },
        { label: "English", value: "en" },
        { label: "Русский", value: "ru" },
      ],
      admin: {
        position: "sidebar",
        description: l(
          "Məktublar və portal bu dildə olur.",
          "Emails and the portal use this language.",
          "Письма и портал на этом языке.",
        ),
      },
    },
  ],
};

import type {
  Access,
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from "payload";
import { Forbidden } from "payload";
import { owner } from "@/data/owner";
import type { Locale } from "@/i18n/routing";
import { isAdmin } from "@/payload/access";
import { portalGroup } from "@/payload/collections/client-projects";
import { commentEmail, portalUrl } from "@/payload/email";
import { l } from "@/payload/fields";

/** Admins see every comment; a client the comments on their own projects. */
const ownComments: Access = ({ req }) => {
  if (req.user?.collection === "users") return true;
  if (req.user?.collection === "clients") return { "project.client": { equals: req.user.id } };
  return false;
};

/** Anyone signed in may comment: admins anywhere, clients on their own projects (checked below). */
const signedIn: Access = ({ req }) => Boolean(req.user);

/** The author is whoever is signed in, and a client may only comment on a project of theirs. */
const setAuthor: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== "create" || !req.user) return data;
  if (req.user.collection === "clients") {
    const projectId = typeof data.project === "object" ? data.project?.id : data.project;
    const project = await req.payload
      .findByID({
        collection: "client-projects",
        id: projectId,
        depth: 0,
        req,
        overrideAccess: false,
      })
      .catch(() => null);
    if (!project) throw new Forbidden(req.t);
  }
  return { ...data, author: { relationTo: req.user.collection, value: req.user.id } };
};

/** Emails the other side: me when a client writes, the client when I do. */
const notify: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== "create" || req.context?.skipEmail) return doc;
  try {
    const project = await req.payload.findByID({
      collection: "client-projects",
      id: typeof doc.project === "object" ? doc.project.id : doc.project,
      depth: 1,
      req,
    });
    const client = typeof project.client === "object" ? project.client : null;
    if (!client) return doc;
    const fromClient = doc.author?.relationTo === "clients";
    if (fromClient) {
      const settings = await req.payload.findGlobal({ slug: "site-settings", depth: 0, req });
      const mail = commentEmail({
        locale: "az",
        projectTitle: project.title,
        author: client.name,
        body: doc.body,
        href: `${process.env.NEXT_PUBLIC_SITE_URL || "https://faridzeynalov.com"}/admin/collections/project-comments/${doc.id}`,
      });
      await req.payload.sendEmail({ to: settings.email || owner.email, ...mail });
    } else {
      const locale = (client.language ?? "az") as Locale;
      const mail = commentEmail({
        locale,
        projectTitle: project.title,
        author: "Farid Zeynalov",
        body: doc.body,
        href: portalUrl(locale, `/projects/${project.id}`),
      });
      await req.payload.sendEmail({ to: client.email, ...mail });
    }
  } catch (error) {
    req.payload.logger.warn({ msg: "Comment email not sent", err: error });
  }
  return doc;
};

/**
 * The conversation on a client project: the client writes in the portal, I answer here (or
 * there). Each side gets an email about the other's comments.
 */
export const ProjectComments: CollectionConfig = {
  slug: "project-comments",
  labels: {
    singular: l("Şərh", "Comment", "Комментарий"),
    plural: l("Şərhlər", "Comments", "Комментарии"),
  },
  admin: {
    group: portalGroup,
    useAsTitle: "body",
    defaultColumns: ["body", "project", "author", "createdAt"],
  },
  defaultSort: "-createdAt",
  access: { read: ownComments, create: signedIn, update: isAdmin, delete: isAdmin },
  hooks: { beforeChange: [setAuthor], afterChange: [notify] },
  fields: [
    {
      name: "project",
      label: l("Layihə", "Project", "Проект"),
      type: "relationship",
      relationTo: "client-projects",
      required: true,
      index: true,
    },
    {
      name: "body",
      label: l("Şərh", "Comment", "Комментарий"),
      type: "textarea",
      required: true,
      maxLength: 5000,
    },
    {
      name: "author",
      label: l("Müəllif", "Author", "Автор"),
      type: "relationship",
      relationTo: ["users", "clients"],
      admin: { readOnly: true, position: "sidebar" },
    },
  ],
};

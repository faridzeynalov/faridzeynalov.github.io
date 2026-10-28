import type {
  Access,
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
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

const idOf = (value: unknown) =>
  value && typeof value === "object" ? (value as { id: number }).id : (value as number | null);

/**
 * The author is whoever is signed in, and a client may only comment on a project of theirs. A reply
 * hangs off the first comment of its thread (one level, as on Instagram) in the same project, and
 * is about the same screen; a comment on a screen must be on one of the project's.
 */
const setAuthor: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== "create") return data;
  const projectId = idOf(data.project);
  if (req.user?.collection === "clients") {
    const project = await req.payload
      .findByID({
        collection: "client-projects",
        id: projectId as number,
        depth: 0,
        req,
        overrideAccess: false,
      })
      .catch(() => null);
    if (!project) throw new Forbidden(req.t);
  }
  let parent = idOf(data.parent);
  let screen = idOf(data.screen);
  if (parent) {
    const replyTo = await req.payload
      .findByID({ collection: "project-comments", id: parent, depth: 0, req })
      .catch(() => null);
    if (!replyTo || idOf(replyTo.project) !== projectId) throw new Forbidden(req.t);
    parent = idOf(replyTo.parent) ?? replyTo.id;
    screen = idOf(replyTo.screen);
  } else if (screen) {
    const onScreen = await req.payload
      .findByID({ collection: "project-screens", id: screen, depth: 0, req })
      .catch(() => null);
    if (!onScreen || idOf(onScreen.project) !== projectId) throw new Forbidden(req.t);
  }
  return {
    ...data,
    parent: parent || null,
    screen: screen || null,
    ...(req.user && { author: { relationTo: req.user.collection, value: req.user.id } }),
  };
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
    const screenId = idOf(doc.screen);
    const screen = screenId
      ? await req.payload.findByID({ collection: "project-screens", id: screenId, depth: 0, req })
      : null;
    const projectTitle = screen ? `${project.title} · ${screen.title}` : project.title;
    const fromClient = doc.author?.relationTo === "clients";
    if (fromClient) {
      const settings = await req.payload.findGlobal({ slug: "site-settings", depth: 0, req });
      const mail = commentEmail({
        locale: "az",
        projectTitle,
        author: client.name,
        body: doc.body,
        href: `${process.env.NEXT_PUBLIC_SITE_URL || "https://faridzeynalov.com"}/admin/collections/project-comments?project=${project.id}`,
      });
      await req.payload.sendEmail({ to: settings.email || owner.email, ...mail });
    } else {
      const locale = (client.language ?? "az") as Locale;
      const mail = commentEmail({
        locale,
        projectTitle,
        author: "Farid Zeynalov",
        body: doc.body,
        href: portalUrl(locale, `/projects/${project.id}${screen ? `/screens/${screen.id}` : ""}`),
      });
      await req.payload.sendEmail({ to: client.email, ...mail });
    }
  } catch (error) {
    req.payload.logger.warn({ msg: "Comment email not sent", err: error });
  }
  return doc;
};

/** A deleted comment takes its replies with it. */
const deleteReplies: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: "project-comments",
    where: { parent: { equals: id } },
    req,
  });
};

/**
 * The conversation on a client project: the client writes in the portal, I answer in the project's
 * conversation in the admin. Each side gets an email about the other's comments.
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
    // The list is an inbox of conversations, with a reply box under each.
    components: {
      views: { list: { Component: "/payload/components/comments-inbox#CommentsInbox" } },
    },
  },
  defaultSort: "-createdAt",
  access: { read: ownComments, create: signedIn, update: isAdmin, delete: isAdmin },
  hooks: { beforeChange: [setAuthor], afterChange: [notify], beforeDelete: [deleteReplies] },
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
      name: "parent",
      label: l("Cavab verilən şərh", "In reply to", "Ответ на комментарий"),
      type: "relationship",
      relationTo: "project-comments",
      index: true,
      filterOptions: ({ data }) =>
        data?.project
          ? { project: { equals: idOf(data.project) }, parent: { exists: false } }
          : false,
      admin: {
        position: "sidebar",
        description: l(
          "Boş qalsa, ümumi şərh olur.",
          "Leave empty for a general comment.",
          "Если пусто, это общий комментарий.",
        ),
      },
    },
    {
      name: "screen",
      label: l("Ekran", "Screen", "Экран"),
      type: "relationship",
      relationTo: "project-screens",
      index: true,
      admin: {
        position: "sidebar",
        description: l(
          "Şərh bu ekran haqqındadır. Boş qalsa, layihə haqqında ümumi şərhdir.",
          "The screen the comment is about. Empty for a comment on the project.",
          "Экран, к которому относится комментарий. Пусто — комментарий к проекту.",
        ),
      },
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

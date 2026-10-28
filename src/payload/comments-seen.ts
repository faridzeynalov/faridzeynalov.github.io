/**
 * Which client comments are new to an admin: each admin's preferences keep, per project, the time
 * of the latest comment they've seen there. Anything a client wrote after that is new.
 */
export const SEEN_KEY = "fz-comments-seen";

export type Seen = Record<string, string>;

type CommentLike = {
  createdAt: string;
  project: number | { id: number } | null | undefined;
  author?: { relationTo: string } | null;
};

const projectOf = (comment: CommentLike) =>
  comment.project && typeof comment.project === "object" ? comment.project.id : comment.project;

export function isNew(comment: CommentLike, seen: Seen | null | undefined) {
  if (comment.author?.relationTo !== "clients") return false;
  const since = seen?.[String(projectOf(comment))];
  return !since || comment.createdAt > since;
}

/** New comments per project id, and in all. */
export function countNew(comments: CommentLike[], seen: Seen | null | undefined) {
  const byProject: Record<number, number> = {};
  let total = 0;
  for (const comment of comments) {
    if (!isNew(comment, seen)) continue;
    const project = projectOf(comment);
    if (project) byProject[project] = (byProject[project] ?? 0) + 1;
    total++;
  }
  return { byProject, total };
}

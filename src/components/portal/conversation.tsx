import { getFormatter, getTranslations } from "next-intl/server";
import { CommentThread } from "@/components/portal/comment-thread";
import { CommentForm } from "@/components/portal/forms";
import { cn } from "@/lib/utils";
import type { ProjectComment } from "@/payload-types";

/**
 * A conversation in the portal, on the project or on one of its screens: each comment with its
 * replies under it and a reply link, then the form for a new comment.
 */
export async function Conversation({
  comments,
  project,
  screen,
  empty,
  placeholder,
}: {
  comments: ProjectComment[];
  project: number;
  screen?: number;
  empty: string;
  placeholder?: string;
}) {
  const [t, format] = await Promise.all([getTranslations("Portal"), getFormatter()]);
  // Replies sit under the comment they answer.
  const parentOf = (comment: ProjectComment) =>
    typeof comment.parent === "object" ? comment.parent?.id : comment.parent;
  const threads = comments.filter((comment) => !parentOf(comment));
  const bubble = (comment: ProjectComment) => {
    const mine = comment.author?.relationTo === "clients";
    return (
      <div
        className={cn(
          "w-fit max-w-[92%] rounded-2xl px-4 py-3",
          mine ? "bg-accent-soft" : "bg-bg-subtle",
        )}
      >
        <p className="mb-1 flex flex-wrap items-baseline gap-x-2 text-xs text-fg-subtle">
          <span className="font-medium text-fg">{mine ? t("you") : t("me")}</span>
          <time dateTime={comment.createdAt}>
            {format.dateTime(new Date(comment.createdAt), {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
        </p>
        <p className="text-sm text-pretty whitespace-pre-line text-fg">{comment.body}</p>
      </div>
    );
  };

  return (
    <>
      {threads.length ? (
        <ul className="mb-6 space-y-5">
          {threads.map((thread) => (
            <li key={thread.id}>
              <CommentThread
                project={project}
                screen={screen}
                thread={thread.id}
                first={bubble(thread)}
                replies={comments
                  .filter((comment) => parentOf(comment) === thread.id)
                  .map((reply) => ({ id: reply.id, node: bubble(reply) }))}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-6 text-sm text-fg-muted">{empty}</p>
      )}
      <CommentForm project={project} screen={screen} placeholder={placeholder} />
    </>
  );
}

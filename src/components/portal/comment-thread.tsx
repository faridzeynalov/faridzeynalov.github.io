"use client";

import { Reply } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { CommentForm } from "@/components/portal/forms";

function ReplyButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("Portal");
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1.5 ml-1 inline-flex items-center gap-1 text-xs font-medium text-fg-subtle transition-colors hover:text-accent"
    >
      <Reply className="size-3.5" aria-hidden />
      {t("reply")}
    </button>
  );
}

/**
 * A comment with its replies under it, each with a "Reply" link; clicking one opens a box at the
 * end of the thread. Replies to a reply join the same thread, as on Instagram.
 */
export function CommentThread({
  project,
  thread,
  first,
  replies,
}: {
  project: number;
  thread: number;
  first: ReactNode;
  replies: { id: number; node: ReactNode }[];
}) {
  const [replying, setReplying] = useState(false);
  const open = () => setReplying(true);
  return (
    <>
      {first}
      <ReplyButton onClick={open} />
      {(replies.length > 0 || replying) && (
        <ul className="mt-2 ml-4 space-y-2 border-l-2 border-border pl-4 md:ml-6">
          {replies.map((reply) => (
            <li key={reply.id}>
              {reply.node}
              <ReplyButton onClick={open} />
            </li>
          ))}
          {replying && (
            <li className="pt-1">
              <CommentForm project={project} parent={thread} onClose={() => setReplying(false)} />
            </li>
          )}
        </ul>
      )}
    </>
  );
}

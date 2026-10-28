"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { ReplyBox, ThreadCard, toThreads, useComments, useCopy } from "./comment-threads";

/**
 * The project's conversation, in the project itself: each comment with its replies and a box to
 * answer it, and a box at the end for a general comment.
 */
export function ProjectThread() {
  const { id } = useDocumentInfo();
  const { text, language } = useCopy();
  const { comments, post, remove } = useComments(id ? `where[project][equals]=${id}` : null);
  const project = Number(id);

  return (
    <section className="fz-thread" id="conversation">
      <h3 className="fz-thread__title">{text.conversation}</h3>
      {!id ? (
        <p className="fz-inbox__empty">{text.unsaved}</p>
      ) : (
        <>
          {comments && !comments.length && <p className="fz-inbox__empty">{text.empty}</p>}
          <div className="fz-inbox__list">
            {toThreads(comments ?? []).map((thread) => (
              <ThreadCard
                key={thread.first.id}
                thread={thread}
                text={text}
                language={language}
                onReply={(body) => post(project, body, thread.first.id)}
                onDelete={(comment) => void remove(comment)}
              />
            ))}
          </div>
          <ReplyBox text={text} placeholder={text.general} onSend={(body) => post(project, body)} />
        </>
      )}
    </section>
  );
}

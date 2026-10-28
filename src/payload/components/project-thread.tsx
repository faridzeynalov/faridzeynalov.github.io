"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { ProjectConversation, useComments, useCopy, useSeen } from "./comment-threads";

/** The project's conversation, in the project itself (the same as in the comments section). */
export function ProjectThread() {
  const { id } = useDocumentInfo();
  const { text } = useCopy();
  const { comments, post, remove } = useComments(id ? `where[project][equals]=${id}` : null);
  const { markSeen } = useSeen();

  return (
    <section className="fz-thread" id="conversation">
      <h3 className="fz-thread__title">{text.conversation}</h3>
      {id ? (
        <ProjectConversation
          project={Number(id)}
          comments={comments}
          post={post}
          remove={remove}
          markSeen={markSeen}
        />
      ) : (
        <p className="fz-inbox__empty">{text.unsaved}</p>
      )}
    </section>
  );
}

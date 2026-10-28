"use client";

import { useConfig, usePreferences, useTranslation } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { SEEN_KEY, type Seen } from "@/payload/comments-seen";

/** The shared pieces of the comment conversations: one in each project, all of them in the list. */

type Ref<T> = (T & { id: number }) | number | null | undefined;

export type Comment = {
  id: number;
  body: string;
  createdAt: string;
  project: Ref<{ title?: string; client?: Ref<{ name?: string }> }>;
  parent?: Ref<object>;
  screen?: Ref<{
    title?: string;
    url?: string | null;
    sizes?: { thumb?: { url?: string | null } };
  }>;
  author?: { relationTo: "users" | "clients"; value: Ref<{ name?: string | null }> } | null;
};

export type Thread = { first: Comment; replies: Comment[]; last: Comment };

const copy = {
  az: {
    comments: "Şərhlər",
    conversation: "Söhbət",
    screen: "Skrinşot",
    unsaved: "Layihəni yadda saxlayandan sonra söhbət burada görünəcək.",
    empty: "Hələ şərh yoxdur.",
    waiting: "Cavab gözləyir",
    me: "Siz",
    client: "Müştəri",
    replyPlaceholder: "Cavab yazın…",
    general: "Ümumi şərh yazın…",
    hint: "Enter — göndər, Shift+Enter — yeni sətir",
    send: "Göndər",
    delete: "Sil",
    confirmDelete: "Bu şərh (və cavabları) silinsin?",
    error: "Alınmadı, yenidən cəhd edin.",
    loading: "Yüklənir…",
    gridIntro: "Müştəri layihələri. Söhbəti açmaq üçün layihəyə klikləyin.",
    allProjects: "Bütün layihələr",
    openProject: "Layihəni aç",
    newCount: (n: number) => `${n} yeni`,
    count: (n: number) => `${n} şərh`,
    noConversation: "Hələ yazışma yoxdur",
    noProjects: "Hələ müştəri layihəsi yoxdur.",
  },
  en: {
    comments: "Comments",
    conversation: "Conversation",
    screen: "Screenshot",
    unsaved: "The conversation shows here once the project is saved.",
    empty: "No comments yet.",
    waiting: "Awaiting reply",
    me: "You",
    client: "Client",
    replyPlaceholder: "Write a reply…",
    general: "Write a general comment…",
    hint: "Enter to send, Shift+Enter for a new line",
    send: "Send",
    delete: "Delete",
    confirmDelete: "Delete this comment (and its replies)?",
    error: "That didn't work, try again.",
    loading: "Loading…",
    gridIntro: "Client projects. Click one to open its conversation.",
    allProjects: "All projects",
    openProject: "Open the project",
    newCount: (n: number) => `${n} new`,
    count: (n: number) => (n === 1 ? "1 comment" : `${n} comments`),
    noConversation: "No messages yet",
    noProjects: "No client projects yet.",
  },
  ru: {
    comments: "Комментарии",
    conversation: "Переписка",
    screen: "Скриншот",
    unsaved: "Переписка появится здесь после сохранения проекта.",
    empty: "Комментариев пока нет.",
    waiting: "Ждёт ответа",
    me: "Вы",
    client: "Клиент",
    replyPlaceholder: "Напишите ответ…",
    general: "Напишите общий комментарий…",
    hint: "Enter — отправить, Shift+Enter — новая строка",
    send: "Отправить",
    delete: "Удалить",
    confirmDelete: "Удалить этот комментарий (и ответы)?",
    error: "Не получилось, попробуйте ещё раз.",
    loading: "Загрузка…",
    gridIntro: "Проекты клиентов. Нажмите на проект, чтобы открыть переписку.",
    allProjects: "Все проекты",
    openProject: "Открыть проект",
    newCount: (n: number) => `${n} новых`,
    count: (n: number) => `Комментариев: ${n}`,
    noConversation: "Переписки пока нет",
    noProjects: "Проектов клиентов пока нет.",
  },
};

export type Copy = (typeof copy)["az"];

export function useCopy() {
  const { i18n } = useTranslation();
  return { text: copy[i18n.language as keyof typeof copy] ?? copy.en, language: i18n.language };
}

export const idOf = (ref: Ref<object>) => (ref && typeof ref === "object" ? ref.id : ref);
export const fromClient = (comment: Comment) => comment.author?.relationTo === "clients";

/** Groups comments (oldest first) into threads: a comment and its replies. */
export function toThreads(comments: Comment[]): Thread[] {
  return comments
    .filter((comment) => !idOf(comment.parent))
    .map((first) => {
      const replies = comments.filter((comment) => idOf(comment.parent) === first.id);
      return { first, replies, last: replies.at(-1) ?? first };
    });
}

/** Loads comments (oldest first) through the REST API, with a reload for after a change. */
export function useComments(query: string | null) {
  const { config } = useConfig();
  const api = `${config.serverURL ?? ""}${config.routes.api}/project-comments`;
  const [comments, setComments] = useState<Comment[] | null>(null);

  const fetchComments = useCallback(async () => {
    const response = await fetch(`${api}?${query}&sort=createdAt&depth=2&pagination=false`, {
      credentials: "include",
    });
    return response.ok ? ((await response.json()) as { docs: Comment[] }).docs : null;
  }, [api, query]);

  useEffect(() => {
    if (query === null) return;
    let current = true;
    void fetchComments().then((docs) => {
      if (current && docs) setComments(docs);
    });
    return () => {
      current = false;
    };
  }, [fetchComments, query]);

  const reload = async () => {
    const docs = await fetchComments();
    if (docs) setComments(docs);
  };

  const post = async (project: number, body: string, parent?: number) => {
    const response = await fetch(api, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, body, parent: parent ?? null }),
    });
    if (response.ok) await reload();
    return response.ok;
  };

  const remove = async (comment: Comment) => {
    await fetch(`${api}/${comment.id}`, { method: "DELETE", credentials: "include" });
    await reload();
  };

  return { comments, post, remove };
}

/** A one-line box that grows as you type; Enter sends, Shift+Enter starts a new line. */
export function ReplyBox({
  placeholder,
  onSend,
  text,
}: {
  placeholder: string;
  onSend: (body: string) => Promise<boolean>;
  text: Copy;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const send = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    const ok = await onSend(body.trim());
    setBusy(false);
    setFailed(!ok);
    if (ok) setBody("");
  };
  return (
    <div className="fz-reply">
      <div className="fz-reply__box">
        <textarea
          value={body}
          rows={1}
          maxLength={5000}
          placeholder={placeholder}
          title={text.hint}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <button
          type="button"
          className="fz-reply__send"
          onClick={() => void send()}
          disabled={busy || !body.trim()}
        >
          {text.send}
        </button>
      </div>
      {failed && <p className="fz-reply__error">{text.error}</p>}
    </div>
  );
}

function Message({
  comment,
  text,
  language,
  onDelete,
}: {
  comment: Comment;
  text: Copy;
  language: string;
  onDelete: (comment: Comment) => void;
}) {
  const author = comment.author?.value;
  const name = fromClient(comment)
    ? (typeof author === "object" && author?.name) || text.client
    : text.me;
  return (
    <div className="fz-msg" data-me={fromClient(comment) ? undefined : ""}>
      <span className="fz-msg__avatar" aria-hidden>
        {name.trim().charAt(0).toUpperCase()}
      </span>
      <div className="fz-msg__main">
        <p className="fz-msg__meta">
          <strong>{name}</strong>
          <time dateTime={comment.createdAt}>
            {new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(
              new Date(comment.createdAt),
            )}
          </time>
          <button
            type="button"
            className="fz-msg__delete"
            onClick={() => window.confirm(text.confirmDelete) && onDelete(comment)}
          >
            {text.delete}
          </button>
        </p>
        <p className="fz-msg__body">{comment.body}</p>
      </div>
    </div>
  );
}

/** A comment, its replies under it, and a box to reply. */
export function ThreadCard({
  thread,
  header,
  text,
  language,
  onReply,
  onDelete,
}: {
  thread: Thread;
  header?: ReactNode;
  text: Copy;
  language: string;
  onReply: (body: string) => Promise<boolean>;
  onDelete: (comment: Comment) => void;
}) {
  const waiting = fromClient(thread.last);
  const screen = typeof thread.first.screen === "object" ? thread.first.screen : null;
  const preview = screen?.sizes?.thumb?.url || screen?.url;
  return (
    <article className="fz-card" data-waiting={waiting ? "" : undefined}>
      {(header || waiting) && (
        <header className="fz-card__header">
          {header}
          {waiting && <span className="fz-card__badge">{text.waiting}</span>}
        </header>
      )}
      {screen && (
        // The screenshot the thread is about; opens full size.
        <a
          className="fz-card__screen"
          href={screen.url ?? undefined}
          target="_blank"
          rel="noreferrer"
        >
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element -- a private file, served by Payload
            <img src={preview} alt="" loading="lazy" />
          )}
          <span>
            <small>{text.screen}</small>
            {screen.title}
          </span>
        </a>
      )}
      <Message comment={thread.first} text={text} language={language} onDelete={onDelete} />
      {thread.replies.length > 0 && (
        <div className="fz-card__replies">
          {thread.replies.map((reply) => (
            <Message
              key={reply.id}
              comment={reply}
              text={text}
              language={language}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
      <ReplyBox text={text} placeholder={text.replyPlaceholder} onSend={onReply} />
    </article>
  );
}

/**
 * The admin's "seen up to" per project (see comments-seen.ts), and a way to move it forward, which
 * also refreshes the sidebar's count.
 */
export function useSeen() {
  const { getPreference, setPreference } = usePreferences();
  const router = useRouter();
  const [seen, setSeen] = useState<Seen | null>(null);

  useEffect(() => {
    let current = true;
    void getPreference<Seen | null>(SEEN_KEY).then((value) => {
      if (current) setSeen(value ?? {});
    });
    return () => {
      current = false;
    };
  }, [getPreference]);

  const markSeen = useCallback(
    async (project: number, latest: string) => {
      setSeen((previous) => ({ ...previous, [project]: latest }));
      await setPreference<Seen>(SEEN_KEY, { [project]: latest }, true);
      router.refresh();
    },
    [router, setPreference],
  );

  return { seen, markSeen };
}

/**
 * One project's conversation: its threads in order, each with a reply box, and a box for a general
 * comment. Opening it marks its comments as seen.
 */
export function ProjectConversation({
  project,
  comments,
  post,
  remove,
  markSeen,
}: {
  project: number;
  comments: Comment[] | null;
  post: (project: number, body: string, parent?: number) => Promise<boolean>;
  remove: (comment: Comment) => Promise<void>;
  markSeen: (project: number, latest: string) => Promise<void>;
}) {
  const { text, language } = useCopy();
  const marked = useRef<string | null>(null);
  const latest = comments?.reduce<string | null>(
    (max, comment) => (!max || comment.createdAt > max ? comment.createdAt : max),
    null,
  );

  useEffect(() => {
    if (!latest || marked.current === latest) return;
    marked.current = latest;
    void markSeen(project, latest);
  }, [latest, markSeen, project]);

  return (
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
      <div className="fz-inbox__general">
        <ReplyBox text={text} placeholder={text.general} onSend={(body) => post(project, body)} />
      </div>
    </>
  );
}

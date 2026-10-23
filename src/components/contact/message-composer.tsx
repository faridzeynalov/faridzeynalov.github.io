"use client";

import { Send } from "lucide-react";
import { useId, useState } from "react";
import { Magnetic } from "@/components/contact/magnetic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOPICS = [
  "Full-time role",
  "Freelance project",
  "Website redesign",
  "AI feature",
  "Just saying hi",
] as const;

/**
 * Builds a ready-to-send email and opens it in the visitor's mail app (mailto:).
 * Nothing is sent from this site — it's static, with no backend.
 */
export function MessageComposer({ email }: { email: string }) {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(TOPICS[1]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const nameId = useId();
  const messageId = useId();
  const noteId = useId();

  function compose() {
    const subject = `${topic}${name ? ` — ${name}` : ""}`;
    const body = message || `Hi Farid,\n\n`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        compose();
      }}
      aria-describedby={noteId}
      className="rounded-3xl border border-border bg-bg-elevated p-6 md:p-10"
    >
      <fieldset>
        <legend className="font-mono text-xs text-fg-subtle uppercase">
          What&rsquo;s it about?
        </legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOPICS.map((option) => {
            const selected = option === topic;
            return (
              <label
                key={option}
                className={cn(
                  "relative cursor-pointer rounded-full border px-4 py-2 text-sm transition-[background-color,border-color,color] duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                  selected
                    ? "border-transparent bg-fg text-bg"
                    : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                )}
              >
                <input
                  type="radio"
                  name="topic"
                  value={option}
                  checked={selected}
                  onChange={() => setTopic(option)}
                  className="sr-only"
                />
                {option}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8">
        <label htmlFor={nameId} className="font-mono text-xs text-fg-subtle uppercase">
          Your name <span className="normal-case">(optional)</span>
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="mt-2 w-full border-b border-border-strong bg-transparent py-3 text-lg outline-none placeholder:text-fg-subtle focus:border-accent"
          placeholder="Jane Doe"
        />
      </div>

      <div className="mt-8">
        <label htmlFor={messageId} className="font-mono text-xs text-fg-subtle uppercase">
          Message
        </label>
        <textarea
          id={messageId}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="mt-2 w-full resize-y border-b border-border-strong bg-transparent py-3 text-lg outline-none placeholder:text-fg-subtle focus:border-accent"
          placeholder="A few lines about the role or project, timeline and anything else useful."
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
        <p id={noteId} className="max-w-xs text-sm text-fg-subtle">
          Opens your email app with this message ready to send. Nothing is sent from this site.
        </p>
        <Magnetic>
          <Button type="submit" size="lg" className="h-14 px-8 text-base">
            Write the email
            <Send aria-hidden />
          </Button>
        </Magnetic>
      </div>
    </form>
  );
}

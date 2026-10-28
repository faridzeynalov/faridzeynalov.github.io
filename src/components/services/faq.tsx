import { Plus } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

/**
 * Questions people ask before getting a website made (cost, timelines, mobile, Google), as
 * native disclosure widgets so they work without JavaScript and every answer is in the HTML
 * that search engines read.
 */
export function Faq({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <Stagger as="ul" className="grid gap-3">
      {items.map((item) => (
        <StaggerItem as="li" key={item.question}>
          <details className="group rounded-2xl border border-border bg-bg-elevated transition-colors open:border-border-strong hover:border-border-strong">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-base font-medium text-fg md:text-lg [&::-webkit-details-marker]:hidden">
              <h3>{item.question}</h3>
              <Plus
                aria-hidden
                className="size-5 shrink-0 text-accent transition-transform duration-300 group-open:rotate-45"
              />
            </summary>
            <p className="max-w-3xl px-6 pb-6 text-pretty text-fg-muted">{item.answer}</p>
          </details>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

import { Braces, Layers, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

const icons: LucideIcon[] = [Braces, Layers, ShieldCheck, Wrench];

export function Skills() {
  return (
    <section aria-labelledby="skills-title" className="relative py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          id="skills-title"
          index="02"
          eyebrow="Skills & expertise"
          title={
            <>
              The toolkit <Accent>I reach for daily.</Accent>
            </>
          }
          description="Everything here is something I use in production — no filler, no percentages."
        />

        <Stagger className="mt-14 grid gap-3 md:grid-cols-6" stagger={0.1}>
          {profile.skills.map((group, index) => {
            const Icon = icons[index % icons.length];
            const wide = index === 1 || index === 3;
            return (
              <StaggerItem
                key={group.title}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-6 transition-colors duration-500 hover:border-border-strong md:p-7",
                  wide ? "md:col-span-4" : "md:col-span-2",
                )}
              >
                <div
                  className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-accent/0 blur-3xl transition-colors duration-700 group-hover:bg-accent/15"
                  aria-hidden
                />
                <div className="relative flex items-start justify-between gap-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-bg-subtle text-fg-muted transition-colors group-hover:text-accent">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="font-mono text-xs text-fg-subtle">
                    {String(group.items.length).padStart(2, "0")} items
                  </span>
                </div>
                <h3 className="relative mt-6 text-lg font-semibold tracking-tight">
                  {group.title}
                </h3>
                <p className="relative mt-1 text-sm text-fg-muted">{group.description}</p>
                <ul className="relative mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-border bg-bg-subtle/60 px-3 py-1.5 text-[13px] text-fg transition-colors hover:border-border-strong"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

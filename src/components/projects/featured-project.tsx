import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ImageReveal } from "@/components/motion/image-reveal";
import { Reveal } from "@/components/motion/reveal";
import { BrowserFrame, PhoneFrame } from "@/components/projects/device-frames";
import { Badge } from "@/components/ui/badge";
import { useAppLocale } from "@/i18n/use-app-locale";
import { industryLabels, useContentOverrides } from "@/lib/content-overrides";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface FeaturedProjectProps {
  project: Project;
  index: number;
}

/** Large editorial row used for the home page's selected work. */
export function FeaturedProject({ project, index }: FeaturedProjectProps) {
  const t = useTranslations("ProjectCard");
  const tc = useTranslations("Common");
  const locale = useAppLocale();
  const admin = useContentOverrides();
  const reversed = index % 2 === 1;
  const href = `/portfolio/${project.slug}`;

  return (
    <article className="group grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <ImageReveal className={cn("lg:col-span-7", reversed && "lg:order-2")}>
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className="relative block aspect-[16/12] overflow-hidden rounded-3xl border border-border bg-bg-subtle sm:aspect-[16/11]"
        >
          <div
            className="absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-60"
            style={{
              background: `radial-gradient(80% 70% at ${reversed ? "80%" : "20%"} 10%, ${project.accent}, transparent 72%)`,
            }}
          />
          <div className="absolute inset-0 bg-grid opacity-70" />
          {project.images && (
            <>
              <BrowserFrame
                domain={project.domain}
                className="absolute top-[10%] left-[7%] w-[86%] transition-transform duration-700 ease-out-expo group-hover:-translate-y-2 group-hover:scale-[1.015]"
              >
                <Image
                  src={project.images.cover}
                  alt=""
                  sizes="(min-width: 1024px) 600px, 86vw"
                  className="h-auto w-full"
                  placeholder="blur"
                />
              </BrowserFrame>
              <PhoneFrame className="absolute right-[4%] -bottom-[14%] hidden w-[21%] transition-transform delay-75 duration-700 ease-out-expo group-hover:-translate-y-4 sm:block">
                <Image
                  src={project.images.mobile}
                  alt=""
                  sizes="160px"
                  className="h-auto w-full"
                  placeholder="blur"
                />
              </PhoneFrame>
            </>
          )}
        </Link>
      </ImageReveal>

      <Reveal className={cn("lg:col-span-5", reversed && "lg:order-1")} delay={0.1}>
        <p className="flex items-center gap-3 font-mono text-xs text-fg-subtle uppercase">
          <span className="text-accent">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-6 bg-border-strong" aria-hidden />
          {industryLabels(locale, admin)[project.industry]}
        </p>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-balance md:text-4xl">
          <Link href={href} className="transition-colors hover:text-accent">
            {project.name}
          </Link>
        </h3>
        <p className="mt-1 font-mono text-sm text-fg-subtle">{project.domain}</p>
        <p className="mt-5 text-base text-pretty text-fg-muted md:text-lg">{project.overview}</p>

        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label={t("technologiesAndDetails")}>
          {[...project.stack, ...(project.group ? [project.group] : [])].map((item) => (
            <li key={item}>
              <Badge>{item}</Badge>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
          <Link href={href} className="group/link inline-flex items-center gap-2 text-fg">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover/link:bg-[length:100%_1px]">
              {t("viewProject")}
            </span>
            <ArrowRight
              className="size-4 transition-transform group-hover/link:translate-x-1"
              aria-hidden
            />
            <span className="sr-only">: {project.name}</span>
          </Link>
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-fg"
          >
            {t("liveSite")}
            <ArrowUpRight className="size-3.5" aria-hidden />
            <span className="sr-only">
              : {project.domain} {tc("opensNewTab")}
            </span>
          </a>
        </div>
      </Reveal>
    </article>
  );
}

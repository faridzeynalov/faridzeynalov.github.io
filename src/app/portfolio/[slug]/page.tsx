import { ArrowLeft, ArrowUpRight, Check, Info } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Enter } from "@/components/motion/enter";
import { ImageReveal } from "@/components/motion/image-reveal";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { BrowserFrame, PhoneFrame } from "@/components/projects/device-frames";
import { ProjectPager } from "@/components/projects/project-pager";
import { UnavailablePreview } from "@/components/projects/unavailable-preview";
import { ContactCta } from "@/components/sections/contact-cta";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { getIndustryLabel } from "@/lib/industries";
import { getAdjacentProjects, getAllProjects, getProjectBySlug } from "@/lib/projects";
import { withoutBasePath } from "@/lib/site";

// Only the projects in src/data/projects.ts exist — everything is generated at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  const title = `${project.name} — ${getIndustryLabel(project.industry)}`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/portfolio/${project.slug}/` },
    openGraph: {
      title,
      description: project.summary,
      url: `/portfolio/${project.slug}/`,
      images: project.images
        ? [
            {
              url: withoutBasePath(project.images.cover.src),
              width: project.images.cover.width,
              height: project.images.cover.height,
              alt: `Homepage of ${project.domain}`,
            },
          ]
        : [{ url: "/og.png", width: 1200, height: 630 }],
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const adjacent = getAdjacentProjects(project.slug);
  const job = profile.experience[0];

  const meta = [
    { label: "Role", value: `${job.role}, ${job.company}` },
    { label: "Industry", value: getIndustryLabel(project.industry) },
    ...(project.group ? [{ label: "Portfolio", value: project.group }] : []),
    ...(project.languages.length
      ? [{ label: "Site languages", value: project.languages.join(", ") }]
      : []),
  ];

  return (
    <article>
      {/* Header */}
      <header className="relative overflow-hidden pt-28 pb-12 md:pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute inset-0 bg-grid mask-radial" />
          <div
            className="absolute -top-40 left-1/2 h-[30rem] w-[56rem] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
            style={{ backgroundColor: project.accent }}
          />
        </div>

        <div className="container-page">
          <Enter>
            <Link
              href="/portfolio/"
              className="group inline-flex items-center gap-2 font-mono text-xs text-fg-muted uppercase transition-colors hover:text-fg"
            >
              <ArrowLeft
                className="size-3.5 transition-transform group-hover:-translate-x-1"
                aria-hidden
              />
              All projects
            </Link>
          </Enter>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <Enter className="lg:col-span-8" delay={60}>
              <p className="flex items-center gap-2.5 font-mono text-xs text-fg-subtle uppercase">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: project.accent }}
                  aria-hidden
                />
                {getIndustryLabel(project.industry)}
                {project.group && <span>· {project.group}</span>}
              </p>
              <h1 className="mt-5 text-[clamp(2.5rem,6.5vw,5rem)] leading-[1] font-semibold tracking-[-0.045em] text-balance">
                {project.name}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-pretty text-fg-muted md:text-xl">
                {project.overview}
              </p>
            </Enter>

            <Enter className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end" delay={160}>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ size: "lg" })}
              >
                Visit {project.domain}
                <ArrowUpRight aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Enter>
          </div>
        </div>
      </header>

      {/* Preview */}
      <section aria-label="Preview" className="pb-16">
        <div className="container-page">
          <Enter delay={240} className="[--enter-y:28px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-bg-subtle px-[5%] pt-[5%] pb-[8%] sm:pb-[5%]">
              <div
                className="pointer-events-none absolute inset-0 opacity-35"
                style={{
                  background: `radial-gradient(70% 60% at 50% 0%, ${project.accent}, transparent 75%)`,
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-grid opacity-70"
                aria-hidden
              />
              {project.images ? (
                <div className="relative">
                  <BrowserFrame domain={project.domain} className="sm:mr-[12%]">
                    <Image
                      src={project.images.cover}
                      alt={`Homepage of ${project.domain} on desktop`}
                      sizes="(min-width: 1216px) 960px, 80vw"
                      priority
                      placeholder="blur"
                      className="h-auto w-full"
                    />
                  </BrowserFrame>
                  <PhoneFrame className="absolute right-0 -bottom-[6%] w-[24%] min-w-[96px] sm:w-[19%]">
                    <Image
                      src={project.images.mobile}
                      alt={`Homepage of ${project.domain} on mobile`}
                      sizes="(min-width: 1216px) 220px, 24vw"
                      placeholder="blur"
                      className="h-auto w-full"
                    />
                  </PhoneFrame>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-border-strong">
                  <UnavailablePreview project={project} />
                </div>
              )}
            </div>
          </Enter>
          {project.images && (
            <p className="mt-4 font-mono text-xs text-fg-subtle">
              Screenshots of the live site, captured October 2026.
            </p>
          )}
        </div>
      </section>

      {/* Details */}
      <section aria-label="Project details" className="py-16">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <dl className="divide-y divide-border rounded-2xl border border-border bg-bg-elevated">
              {meta.map((item) => (
                <div key={item.label} className="px-5 py-4">
                  <dt className="font-mono text-[11px] text-fg-subtle uppercase">{item.label}</dt>
                  <dd className="mt-1 text-[15px]">{item.value}</dd>
                </div>
              ))}
              {project.stack.length > 0 && (
                <div className="px-5 py-4">
                  <dt className="font-mono text-[11px] text-fg-subtle uppercase">Stack</dt>
                  <dd className="mt-2">
                    <ul className="flex flex-wrap gap-1.5">
                      {project.stack.map((item) => (
                        <li key={item}>
                          <Badge>{item}</Badge>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-fg-subtle">
                      Detected from the live site&rsquo;s public build.
                    </p>
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>

          <div className="space-y-14 lg:col-span-8">
            {project.unavailableReason && (
              <Reveal>
                <Notice>{project.unavailableReason}</Notice>
              </Reveal>
            )}

            {project.contribution && (
              <Reveal>
                <h2 className="text-2xl font-semibold tracking-tight">My role</h2>
                <p className="mt-4 text-lg text-pretty text-fg-muted">{project.contribution}</p>
              </Reveal>
            )}

            {project.liveFeatures.length > 0 && (
              <div>
                <Reveal>
                  <h2 className="text-2xl font-semibold tracking-tight">On the live site</h2>
                  <p className="mt-2 text-fg-muted">
                    What visitors can see and do on {project.domain} today.
                  </p>
                </Reveal>
                <Stagger as="ul" className="mt-6 grid gap-3 sm:grid-cols-2" stagger={0.06}>
                  {project.liveFeatures.map((feature) => (
                    <StaggerItem
                      as="li"
                      key={feature}
                      className="flex gap-3 rounded-xl border border-border bg-bg-elevated p-4 text-[15px] text-pretty"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                      {feature}
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            )}

            {project.note && (
              <Reveal>
                <Notice>{project.note}</Notice>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {project.images?.section && (
        <section aria-labelledby="gallery-title" className="py-16">
          <div className="container-page">
            <Reveal>
              <h2 id="gallery-title" className="text-2xl font-semibold tracking-tight">
                Further down the page
              </h2>
            </Reveal>
            <ImageReveal className="mt-8">
              <BrowserFrame domain={project.domain}>
                <Image
                  src={project.images.section}
                  alt={`A section further down the ${project.domain} homepage`}
                  sizes="(min-width: 1216px) 1152px, 92vw"
                  placeholder="blur"
                  className="h-auto w-full"
                />
              </BrowserFrame>
            </ImageReveal>
          </div>
        </section>
      )}

      {/* Pager */}
      {adjacent && (
        <section aria-label="Other projects" className="pt-16">
          <div className="container-page">
            <ProjectPager previous={adjacent.previous} next={adjacent.next} />
          </div>
        </section>
      )}

      <ContactCta compact />
    </article>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-3 rounded-xl border border-border bg-bg-subtle/60 p-4 text-sm text-pretty text-fg-muted">
      <Info className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />
      {children}
    </p>
  );
}

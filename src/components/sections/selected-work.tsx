import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FeaturedProject } from "@/components/projects/featured-project";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getAllProjects, getFeaturedProjects } from "@/lib/projects";

export function SelectedWork() {
  const featured = getFeaturedProjects();
  const total = getAllProjects().length;

  return (
    <section aria-labelledby="work-title" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          id="work-title"
          index="01"
          eyebrow="Selected work"
          title={
            <>
              Real sites, <Accent>shipped and live.</Accent>
            </>
          }
          description="A few of the production websites I've worked on at One Studio — from luxury residences to resort booking and online retail."
          action={
            <Link
              href="/portfolio/"
              className={buttonVariants({
                variant: "secondary",
                className: "self-start md:self-auto",
              })}
            >
              All {total} projects
              <ArrowRight aria-hidden />
            </Link>
          }
        />

        <div className="mt-16 space-y-24 md:mt-24 md:space-y-36">
          {featured.map((project, index) => (
            <FeaturedProject key={project.slug} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/i18n/use-app-locale";
import { Link } from "@/i18n/navigation";
import { FeaturedProject } from "@/components/projects/featured-project";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getAllProjects, getFeaturedProjects } from "@/lib/projects";

export function SelectedWork() {
  const locale = useAppLocale();
  const t = useTranslations("SelectedWork");
  const featured = getFeaturedProjects(locale);
  const total = getAllProjects(locale).length;

  return (
    <section aria-labelledby="work-title" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          id="work-title"
          index="01"
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title")} <Accent>{t("accent")}</Accent>
            </>
          }
          description={t("description")}
          action={
            <Link
              href="/portfolio"
              className={buttonVariants({
                variant: "secondary",
                className: "self-start md:self-auto",
              })}
            >
              {t("allProjects", { count: total })}
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

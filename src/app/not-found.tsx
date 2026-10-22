import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80dvh] items-center overflow-hidden pt-24 pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial" aria-hidden />
      <div className="container-page">
        <p className="font-mono text-sm text-accent">Error 404</p>
        <h1 className="mt-4 text-[clamp(3rem,10vw,7rem)] leading-none font-semibold tracking-[-0.05em]">
          Nothing{" "}
          <span className="font-serif font-normal tracking-normal text-fg-muted italic">here.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-fg-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Try the home page or
          browse the portfolio.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            <ArrowLeft aria-hidden />
            Back home
          </Link>
          <Link href="/portfolio/" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            View portfolio
          </Link>
        </div>
      </div>
    </section>
  );
}

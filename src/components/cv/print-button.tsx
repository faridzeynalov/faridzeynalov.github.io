"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  const t = useTranslations("CvPage");
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      <Printer aria-hidden />
      {t("print")}
    </Button>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
    >
      <Printer className="size-4" /> Cetak SPK / Nota
    </Button>
  );
}

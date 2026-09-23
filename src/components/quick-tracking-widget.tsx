"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

export function QuickTrackingWidget() {
  const router = useRouter();
  const [ticketInput, setTicketInput] = React.useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    router.push(`/tracking?ticket=${encodeURIComponent(ticketInput.trim())}`);
  };

  return (
    <form
      onSubmit={handleTrack}
      className="flex flex-col sm:flex-row items-center gap-2 max-w-lg w-full bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800"
    >
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          value={ticketInput}
          onChange={(e) => setTicketInput(e.target.value)}
          placeholder="Masukkan No. Tiket (TKT-...) / WhatsApp"
          className="pl-9 border-0 shadow-none focus-visible:ring-0 text-sm h-10"
        />
      </div>
        <Button
          type="submit"
          className="w-full sm:w-auto gap-1.5 h-10 px-6 font-bold bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_8px_0_rgba(0,45,98,0.25)] rounded-lg transition-all"
        >
          <span>Lacak Servis</span>
          <ArrowRight className="size-4 text-[#00A896]" />
        </Button>
      </form>
  );
}

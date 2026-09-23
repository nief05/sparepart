import { Suspense } from "react";
import Link from "next/link";
import { TrackingClient } from "./tracking-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BeresLogo } from "@/components/beres-logo";

export const metadata = {
  title: "Lacak Status Servis Beres.in",
  description: "Pantau status perbaikan smartphone dan gadget Anda secara real-time di Beres.in.",
};

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B192C]">
      {/* Header Bar */}
      <header className="border-b border-[#E2E8F0] dark:border-[#1E3A5F] bg-white dark:bg-[#0E1F36] sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <BeresLogo markSize={32} />
          </Link>

          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs font-semibold text-[#002D62] dark:text-[#00A896] hover:bg-[#E6EDF6] dark:hover:bg-[#1E3A5F]">
              <ArrowLeft className="size-4" /> Beranda
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Suspense
          fallback={
            <div className="text-center py-16 text-[#64748B]">
              Memuat portal pelacakan servis...
            </div>
          }
        >
          <TrackingClient />
        </Suspense>
      </main>
    </div>
  );
}

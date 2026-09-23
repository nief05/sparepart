"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Plus,
  Layers,
  Search,
  ArrowLeft,
  Percent,
  BarChart3,
  CreditCard,
  TrendingUp,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";
import { BeresLogo } from "@/components/beres-logo";

const MENU_ITEMS = [
  {
    group: "Pusat Kontrol",
    items: [
      {
        label: "Pusat Analitik & KPI",
        href: "/dashboard/analytics",
        icon: TrendingUp,
      },
    ],
  },
  {
    group: "Modul Workshop",
    items: [
      {
        label: "Kanban & Order Servis",
        href: "/dashboard/repairs",
        icon: LayoutGrid,
      },
      {
        label: "Intake Servis Baru",
        href: "/dashboard/repairs/new",
        icon: Plus,
      },
      {
        label: "Inventaris Sparepart",
        href: "/dashboard/inventory",
        icon: Layers,
      },
      {
        label: "Kasir & Point of Sale",
        href: "/dashboard/pos",
        icon: CreditCard,
      },
    ],
  },
  {
    group: "Finansial & Kinerja",
    items: [
      {
        label: "Bagi Hasil & Komisi",
        href: "/dashboard/commissions",
        icon: Percent,
      },
      {
        label: "Rekap Kas & Laporan",
        href: "/dashboard/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    group: "Portal & Publik",
    items: [
      {
        label: "Portal Tracking Publik",
        href: "/tracking",
        icon: Search,
        external: true,
      },
      {
        label: "Website Beranda",
        href: "/",
        icon: ArrowLeft,
      },
    ],
  },
];

function NavContent({
  pathname,
  onItemClick,
  onLogout,
}: {
  pathname: string;
  onItemClick?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0E1F36]">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E3A5F] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BeresLogo markSize={30} />
        </Link>
      </div>

      {/* Nav Menu */}
      <div className="p-3 space-y-5 flex-1 overflow-y-auto">
        {MENU_ITEMS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] px-3.5 pb-1">
              {group.group}
            </p>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard/repairs"
                  ? pathname === "/dashboard/repairs"
                  : pathname.startsWith(item.href) && item.href !== "/";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  target={item.external ? "_blank" : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#002D62] text-white shadow-[0_2px_8px_0_rgba(0,45,98,0.25)] font-semibold border-l-4 border-[#00A896]"
                      : "text-[#334155] dark:text-[#CBD5E1] hover:bg-[#EEF2F6] dark:hover:bg-[#1E3A5F]/50 hover:text-[#002D62] dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`size-4.5 shrink-0 ${
                      isActive ? "text-[#00A896]" : "text-[#64748B]"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Info Bottom */}
      <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1E3A5F] bg-[#F8FAFC] dark:bg-[#0B192C]/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-9 rounded-full bg-[#E6EDF6] dark:bg-[#1E3A5F] text-[#002D62] dark:text-[#00A896] font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#00A896] border-2 border-white dark:border-[#0E1F36]" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-[#002D62] dark:text-white">Admin Workshop</p>
            <p className="text-[11px] text-[#64748B]">admin@rbm.com</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          title="Keluar / Logout"
          className="size-8 rounded-lg text-[#64748B] hover:text-[#E63946] hover:bg-[#FDE8E9] flex items-center justify-center transition-colors"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sesi admin?")) {
      await logoutAction();
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B192C] flex text-[#334155] dark:text-[#94A3B8] relative">
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-white dark:bg-[#0E1F36] border-r border-[#E2E8F0] dark:border-[#1E3A5F] flex-col shrink-0 z-20">
        <NavContent
          pathname={pathname}
          onLogout={handleLogout}
        />
      </aside>

      {/* 2. Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 3. Mobile Slide-Over Sidebar */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#0E1F36] z-50 shadow-2xl md:hidden transition-transform duration-300 ease-in-out flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setMobileOpen(false)}
            className="size-8 rounded-lg bg-[#EEF2F6] dark:bg-[#1E3A5F] flex items-center justify-center text-[#64748B] hover:text-[#002D62]"
          >
            <X className="size-4" />
          </button>
        </div>
        <NavContent
          pathname={pathname}
          onItemClick={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </div>

      {/* 4. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Floating Top Navbar */}
        <header className="sticky top-2 sm:top-4 z-30 mx-3 sm:mx-6 md:mx-8 mb-4 sm:mb-6 h-14 rounded-xl bg-white/95 backdrop-blur-md dark:bg-[#112338]/95 shadow-[0_2px_8px_0_rgba(0,45,98,0.08)] border border-[#E2E8F0] dark:border-[#1E3A5F] px-3 sm:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden size-9 rounded-lg bg-[#EEF2F6] dark:bg-[#1E3A5F] flex items-center justify-center text-[#002D62] hover:bg-[#E6EDF6] transition-colors"
              aria-label="Buka menu navigasi"
            >
              <Menu className="size-5" />
            </button>

            {/* Quick search display */}
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Search className="size-4 text-[#00A896]" />
              <span className="hidden sm:inline">Ketik nomor tiket atau pencarian cepat...</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard/repairs/new">
              <Button size="sm" className="gap-1.5 text-xs font-semibold px-2.5 sm:px-3 bg-[#002D62] hover:bg-[#001F44] text-white shadow-xs">
                <Plus className="size-3.5 text-[#00A896]" />
                <span className="hidden xs:inline sm:inline">Intake Servis</span>
                <span className="xs:hidden sm:hidden">Intake</span>
              </Button>
            </Link>

            <Link href="/tracking" target="_blank" className="hidden sm:inline-flex">
              <div className="size-8 rounded-lg bg-[#EEF2F6] dark:bg-[#1E3A5F] flex items-center justify-center text-[#002D62] hover:text-[#00A896] cursor-pointer transition-colors" title="Tracking Publik">
                <Search className="size-4" />
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar / Logout"
              className="size-8 rounded-lg bg-[#EEF2F6] dark:bg-[#1E3A5F] flex items-center justify-center text-[#64748B] hover:text-[#E63946] hover:bg-[#FDE8E9] transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-3 sm:px-6 md:px-8 pb-12 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

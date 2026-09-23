"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  LayoutGrid,
  Plus,
  Layers,
  Search,
  ArrowLeft,
  Percent,
  BarChart3,
  CreditCard,
  Bell,
  User,
  Shield,
  TrendingUp,
  LogOut,
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

export function SneatSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sesi admin?")) {
      await logoutAction();
      window.location.href = "/login";
    }
  };

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-[#0E1F36] border-r border-[#E2E8F0] dark:border-[#1E3A5F] flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BeresLogo markSize={30} />
        </Link>
      </div>

      {/* Nav Menu */}
      <div className="p-3 space-y-6 flex-1 overflow-y-auto">
        {MENU_ITEMS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a1acb8] dark:text-[#7071a4] px-3.5 pb-1">
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
                  target={item.external ? "_blank" : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#002D62] text-white shadow-[0_2px_8px_0_rgba(0,45,98,0.25)] font-semibold border-l-4 border-[#00A896]"
                      : "text-[#334155] dark:text-[#CBD5E1] hover:bg-[#EEF2F6] dark:hover:bg-[#1E3A5F]/50 hover:text-[#002D62]"
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
      <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1E3A5F] bg-[#F8FAFC] dark:bg-[#0B192C]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-9 rounded-full bg-[#E6EDF6] text-[#002D62] dark:text-[#00A896] font-bold text-xs flex items-center justify-center">
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
          onClick={handleLogout}
          title="Keluar / Logout"
          className="size-8 rounded-lg text-[#8592a3] hover:text-[#ff3e1d] hover:bg-[#ff3e1d]/10 flex items-center justify-center transition-colors"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}

export function SneatNavbar() {
  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sesi admin?")) {
      await logoutAction();
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-4 z-30 mx-4 sm:mx-8 mb-6 h-14 rounded-xl bg-white/95 backdrop-blur-md dark:bg-[#112338]/95 shadow-[0_2px_8px_0_rgba(0,45,98,0.08)] border border-[#E2E8F0] dark:border-[#1E3A5F] px-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Search className="size-4 text-[#00A896]" />
        <span className="hidden sm:inline">Ketik tiket atau pencarian cepat...</span>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/repairs/new">
          <Button size="sm" className="gap-1.5 text-xs font-semibold bg-[#002D62] hover:bg-[#001F44] text-white">
            <Plus className="size-3.5 text-[#00A896]" /> Intake Servis
          </Button>
        </Link>
        <div className="size-8 rounded-lg bg-[#EEF2F6] dark:bg-[#1E3A5F] flex items-center justify-center text-[#5B6B79] hover:text-[#00A896] cursor-pointer transition-colors">
          <Bell className="size-4" />
        </div>
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
  );
}

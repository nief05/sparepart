"use client";

import * as React from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SneatStatusBadge } from "@/components/sneat-status-badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Percent,
  RefreshCw,
  Store,
  Layers,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Activity,
  Award,
  ChevronRight,
  ShieldCheck,
  Package,
  Plus,
  ArrowUpRight,
  Calendar,
  Sparkles,
} from "lucide-react";

// Types
export type AnalyticsRawData = {
  totalRevenue: number;
  totalLabor: number;
  totalPartsSales: number;
  totalExpenses: number;
  completedRepairs: number;
  activeRepairs: number;
  criticalStockParts: Array<{
    id: string;
    sku: string;
    name: string;
    brand: string;
    stock: number;
    minStockAlert: number;
    buyPrice: number;
    sellPrice: number;
  }>;
  pendingCommissions: number;
  technicians: Array<{
    id: string;
    name: string;
    email: string;
    completedUnits: number;
    laborGenerated: number;
    qcPassRate: number;
  }>;
  bottlenecks: Array<{
    id: string;
    ticketNo: string;
    customerName: string;
    customerPhone: string;
    device: string;
    status: string;
    technicianName: string;
    hoursInWorkshop: number;
  }>;
  stuckUnits: Array<{
    id: string;
    ticketNo: string;
    customerName: string;
    customerPhone: string;
    device: string;
    status: string;
    stuckHours: number;
    complaint: string;
  }>;
};

type TimeframePreset = "today" | "7d" | "month" | "quarter" | "year";


// Sneat Palette Colors
const SNEAT_COLORS = {
  primary: "#002D62",
  primaryHover: "#001F44",
  primaryTint: "#E6EDF6",
  success: "#00A896",
  successTint: "#E6F6F4",
  warning: "#ffab00",
  warningTint: "#fff2d6",
  danger: "#ff3e1d",
  dangerTint: "#ffe5e0",
  info: "#03c3ec",
  infoTint: "#d7f5fc",
  secondary: "#8592a3",
  secondaryTint: "#ebeef0",
  textPrimary: "#566a7f",
  textHeading: "#384551",
  textMuted: "#a1acb8",
  borderSubtle: "#eceef1",
};

// Funnel Status Mapping
const FUNNEL_CONFIG: Record<string, { label: string; color: string }> = {
  DIAGNOSIS: { label: "Diagnosis", color: "#03c3ec" },
  PROGRESS: { label: "Pengerjaan", color: "#002D62" },
  WAITING_PART: { label: "Tunggu Part", color: "#ffab00" },
  QC: { label: "Quality Check", color: "#8592a3" },
  READY: { label: "Siap Ambil", color: "#00A896" },
};

export function AnalyticsClient({
  initialData,
}: {
  initialData: AnalyticsRawData;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [timeframe, setTimeframe] = React.useState<TimeframePreset>("month");
  const [selectedBranch, setSelectedBranch] = React.useState<string>("all");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoSync, setAutoSync] = React.useState(true);
  const [lastSyncTime, setLastSyncTime] = React.useState<string>("Baru saja");

  // KPI Widget 1 state (Gross vs Net Margin)
  const [revenueToggle, setRevenueToggle] = React.useState<"gross" | "net">("gross");

  // KPI Widget 3 Quick Reorder Dialog
  const [stockDialogOpen, setStockDialogOpen] = React.useState(false);

  // Chart 1 Tab (Cash Flow vs Revenue Sources)
  const [revenueChartTab, setRevenueChartTab] = React.useState<"cashflow" | "sources">("cashflow");

  // Chart 2 Donut interactive filter
  const [funnelFilter, setFunnelFilter] = React.useState<string | null>(null);

  // Chart 3 Fast Moving Spareparts Tab
  const [partsChartTab, setPartsChartTab] = React.useState<"volume" | "profit">("volume");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Timeframe multiplier for reactive dynamic simulation
  const timeframeMultiplier = React.useMemo(() => {
    switch (timeframe) {
      case "today":
        return 0.18;
      case "7d":
        return 0.45;
      case "month":
        return 1.0;
      case "quarter":
        return 2.8;
      case "year":
        return 9.4;
    }
  }, [timeframe]);

  // Branch multiplier
  const branchMultiplier = selectedBranch === "all" ? 1.0 : selectedBranch === "main" ? 0.65 : 0.35;
  const combinedMultiplier = timeframeMultiplier * branchMultiplier;

  // Dynamically scaled KPI values
  const grossRevenue = Math.round(initialData.totalRevenue * combinedMultiplier);
  const totalExpenses = Math.round(initialData.totalExpenses * combinedMultiplier);
  const netMargin = Math.max(0, grossRevenue - totalExpenses);
  const completedCount = Math.max(1, Math.round(initialData.completedRepairs * combinedMultiplier));
  const activeCount = Math.max(1, Math.round(initialData.activeRepairs * (branchMultiplier || 1)));
  const totalUnits = completedCount + activeCount;
  const completionRate = Math.min(99.2, Math.round((completedCount / totalUnits) * 1000) / 10);
  const pendingPayout = Math.round(initialData.pendingCommissions * combinedMultiplier);

  // Dynamic Chart Data for Revenue Dynamics
  const revenueChartData = React.useMemo(() => {
    const pointsCount = timeframe === "today" ? 6 : timeframe === "7d" ? 7 : timeframe === "month" ? 6 : 4;
    const labels =
      timeframe === "today"
        ? ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"]
        : timeframe === "7d"
        ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
        : timeframe === "month"
        ? ["Mgg 1", "Mgg 2", "Mgg 3", "Mgg 4", "Mgg 5", "Mgg 6"]
        : timeframe === "quarter"
        ? ["Bulan 1", "Bulan 2", "Bulan 3", "Bulan 4"]
        : ["Q1", "Q2", "Q3", "Q4"];

    return labels.map((label, idx) => {
      const baseIn = (grossRevenue / pointsCount) * (0.8 + (idx % 3) * 0.2);
      const baseOut = (totalExpenses / pointsCount) * (0.7 + ((idx + 1) % 3) * 0.25);
      const serviceRev = baseIn * 0.62;
      const partRev = baseIn * 0.38;

      return {
        label,
        cashIn: Math.round(baseIn),
        cashOut: Math.round(baseOut),
        serviceRevenue: Math.round(serviceRev),
        sparepartRevenue: Math.round(partRev),
      };
    });
  }, [timeframe, grossRevenue, totalExpenses]);

  // Funnel Donut Chart Data
  const funnelChartData = React.useMemo(() => {
    const rawCounts: Record<string, number> = {
      DIAGNOSIS: 0,
      PROGRESS: 0,
      WAITING_PART: 0,
      QC: 0,
      READY: 0,
    };

    initialData.bottlenecks.forEach((b) => {
      if (rawCounts[b.status] !== undefined) {
        rawCounts[b.status] += 1;
      } else {
        rawCounts["PROGRESS"] += 1;
      }
    });

    // Ensure nice sample baseline if small dataset
    rawCounts.DIAGNOSIS = Math.max(3, rawCounts.DIAGNOSIS);
    rawCounts.PROGRESS = Math.max(5, rawCounts.PROGRESS);
    rawCounts.WAITING_PART = Math.max(2, rawCounts.WAITING_PART);
    rawCounts.QC = Math.max(4, rawCounts.QC);
    rawCounts.READY = Math.max(6, rawCounts.READY);

    return Object.entries(rawCounts).map(([key, count]) => ({
      key,
      name: FUNNEL_CONFIG[key]?.label || key,
      value: Math.round(count * branchMultiplier) || 1,
      color: FUNNEL_CONFIG[key]?.color || SNEAT_COLORS.primary,
    }));
  }, [initialData.bottlenecks, branchMultiplier]);

  // Filtered Bottlenecks Table
  const filteredBottlenecks = React.useMemo(() => {
    if (!funnelFilter) return initialData.bottlenecks;
    return initialData.bottlenecks.filter((b) => b.status === funnelFilter);
  }, [initialData.bottlenecks, funnelFilter]);

  // Top Fast-Moving Spareparts Data
  const fastMovingPartsData = React.useMemo(() => {
    return [
      { name: "LCD iPhone 11 OEM", sku: "LCD-IP11", volume: 42, profit: 8400000, margin: "45%" },
      { name: "Baterai IP 13 Pro 100%", sku: "BAT-IP13P", volume: 38, profit: 6840000, margin: "52%" },
      { name: "LCD Sam A52 OLED", sku: "LCD-SMA52", volume: 29, profit: 5220000, margin: "40%" },
      { name: "Fleksibel Cas IP 12", sku: "FLX-IP12", volume: 27, profit: 2430000, margin: "65%" },
      { name: "Kaca Kamera IP 14 Pro", sku: "CAM-IP14P", volume: 24, profit: 1920000, margin: "70%" },
      { name: "Baterai Xiaomi Redmi N10", sku: "BAT-RN10", volume: 21, profit: 2520000, margin: "48%" },
    ];
  }, []);

  // Live Activity Feed Items
  const activityFeed = React.useMemo(() => [
    {
      id: "act-1",
      title: "Unit Siap Diambil",
      desc: "Teknisi Rizky menyelesaikan QC perbaikan iPhone 13 Pro (TKT-2026-081).",
      time: "2 menit lalu",
      icon: CheckCircle2,
      color: "text-[#00A896] bg-[#E6F6F4]",
    },
    {
      id: "act-2",
      title: "Pelunasan Nota Kasir",
      desc: "Kasir Anita menerima pembayaran lunas nota BRS-20260908-0012 via QRIS (Rp 850.000).",
      time: "14 menit lalu",
      icon: DollarSign,
      color: "text-[#002D62] bg-[#E6EDF6]",
    },
    {
      id: "act-3",
      title: "Restok Suku Cadang Masuk",
      desc: "Gudang menerima pasokan 15 pcs LCD iPhone 11 OEM dari supplier Indotech.",
      time: "42 menit lalu",
      icon: Package,
      color: "text-[#03c3ec] bg-[#d7f5fc]",
    },
    {
      id: "act-4",
      title: "Peringatan Stok Tipis",
      desc: "Stok Baterai iPhone 14 tersisa 1 unit (di bawah limit minimum 3 unit).",
      time: "1 jam lalu",
      icon: AlertTriangle,
      color: "text-[#ffab00] bg-[#fff2d6]",
    },
  ], []);

  // Live Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSyncTime("Baru saja");
    }, 600);
  };

  if (!mounted) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-10 bg-white/60 dark:bg-[#2b2c40] rounded-xl w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-white dark:bg-[#2b2c40] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. TOP INTERACTIVE CONTROLS & FILTER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#2b2c40] p-4 rounded-xl border border-[#eceef1] dark:border-[#444564] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#384551] dark:text-[#dbdcff] flex items-center gap-2">
            <Activity className="size-5 text-[#002D62]" /> Pusat Analitik &amp; Kontrol Manajemen
          </h1>
          <p className="text-xs text-[#8592a3] dark:text-[#a0abb8] mt-0.5">
            Monitoring real-time omzet, alur bottleneck workshop, dan performa teknisi Beres.in.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Preset Pills */}
          <div className="flex items-center gap-1 bg-[#f5f5f9] dark:bg-[#232333] p-1 rounded-lg border border-[#eceef1] dark:border-[#444564]">
            {(
              [
                { key: "today", label: "Hari Ini" },
                { key: "7d", label: "7 Hari" },
                { key: "month", label: "Bulan Ini" },
                { key: "quarter", label: "Kuartal" },
                { key: "year", label: "Tahun Ini" },
              ] as const
            ).map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => setTimeframe(preset.key)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                  timeframe === preset.key
                    ? "bg-[#002D62] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                    : "text-[#566a7f] dark:text-[#a0abb8] hover:bg-white dark:hover:bg-[#2b2c40]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Store / Branch Selector */}
          <div className="w-40">
            <Select value={selectedBranch} onValueChange={(val) => { if (val) setSelectedBranch(val); }}>
              <SelectTrigger className="h-8 text-xs border-[#d9dee3] rounded-lg">
                <Store className="size-3.5 mr-1.5 text-[#002D62]" />
                <SelectValue placeholder="Pilih Cabang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Cabang</SelectItem>
                <SelectItem value="main">Cabang Utama (Sudirman)</SelectItem>
                <SelectItem value="branch2">Workshop 2 (Kuningan)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Live Refresh & Auto Sync */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-2.5 text-xs font-semibold gap-1.5 border-[#d9dee3] hover:bg-[#f5f5f9] text-[#566a7f]"
          >
            <RefreshCw className={`size-3.5 text-[#002D62] ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sinkronkan</span>
          </Button>

          <button
            type="button"
            onClick={() => setAutoSync(!autoSync)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
              autoSync
                ? "bg-[#E6F6F4] text-[#00A896] border-[#00A896]/30"
                : "bg-[#ebeef0] text-[#8592a3] border-transparent"
            }`}
            title="Toggle status sinkronisasi otomatis"
          >
            <span className={`size-2 rounded-full ${autoSync ? "bg-[#00A896] animate-ping" : "bg-[#8592a3]"}`} />
            <span>{autoSync ? "Live Sync ON" : "Paused"}</span>
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE KPI METRIC WIDGETS (SNEAT CARD STYLE WITH MICRO-INTERACTIONS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Widget 1: Omzet & Laba Bersih with Mini-Tab Switcher */}
        <div className="rounded-xl bg-white dark:bg-[#2b2c40] p-5 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] border border-[#eceef1] dark:border-[#444564] transition-all duration-150 flex flex-col justify-between hover:translate-y-[-2px]">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-lg bg-[#E6EDF6] text-[#002D62] flex items-center justify-center shadow-xs">
              <DollarSign className="size-5" />
            </div>
            {/* Mini Toggle inside Card */}
            <div className="flex items-center bg-[#f5f5f9] dark:bg-[#232333] p-0.5 rounded-md border border-[#eceef1] dark:border-[#444564]">
              <button
                type="button"
                onClick={() => setRevenueToggle("gross")}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all ${
                  revenueToggle === "gross"
                    ? "bg-[#002D62] text-white shadow-xs"
                    : "text-[#8592a3] hover:text-[#566a7f]"
                }`}
              >
                Omzet
              </button>
              <button
                type="button"
                onClick={() => setRevenueToggle("net")}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all ${
                  revenueToggle === "net"
                    ? "bg-[#002D62] text-white shadow-xs"
                    : "text-[#8592a3] hover:text-[#566a7f]"
                }`}
              >
                Margin
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a1acb8] mb-1">
                {revenueToggle === "gross" ? "Total Omzet Penjualan" : "Estimasi Laba Bersih"}
              </p>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#E6F6F4] text-[#00A896] flex items-center gap-0.5">
                <TrendingUp className="size-3" /> +14.2%
              </span>
            </div>
            <h3 className="text-2xl font-bold font-sans text-[#384551] dark:text-[#dbdcff]">
              {formatCurrency(revenueToggle === "gross" ? grossRevenue : netMargin)}
            </h3>
            <p className="text-xs text-[#8592a3] mt-1">
              {revenueToggle === "gross"
                ? `Pengeluaran operasional: ${formatCurrency(totalExpenses)}`
                : `Margin sehat ~${Math.round((netMargin / (grossRevenue || 1)) * 100)}% dari pendapatan`}
            </p>
          </div>
        </div>

        {/* Widget 2: Rasio Servis Selesai with Radial Gauge Visual */}
        <div className="rounded-xl bg-white dark:bg-[#2b2c40] p-5 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] border border-[#eceef1] dark:border-[#444564] transition-all duration-150 flex flex-col justify-between hover:translate-y-[-2px]">
          <div className="flex items-center justify-between mb-2">
            <div className="size-10 rounded-lg bg-[#E6F6F4] text-[#00A896] flex items-center justify-center shadow-xs">
              <CheckCircle2 className="size-5" />
            </div>

            {/* Micro Radial Progress Badge */}
            <div className="relative size-11 flex items-center justify-center">
              <svg className="size-11 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#ebeef0] dark:text-[#444564]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#00A896]"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#384551] dark:text-[#dbdcff]">
                {Math.round(completionRate)}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a1acb8] mb-1">
              Rasio Servis Selesai (QC)
            </p>
            <h3 className="text-2xl font-bold font-sans text-[#384551] dark:text-[#dbdcff]">
              {completionRate}%
            </h3>
            <p className="text-xs text-[#8592a3] mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-[#00A896]">{completedCount} Selesai</span>
              <span>&bull;</span>
              <span className="text-[#ffab00]">{activeCount} Sedang Berjalan</span>
            </p>
          </div>
        </div>

        {/* Widget 3: Stok Kritis (Clickable Modal Trigger) */}
        <div
          onClick={() => setStockDialogOpen(true)}
          className="rounded-xl bg-white dark:bg-[#2b2c40] p-5 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] border border-[#eceef1] dark:border-[#444564] transition-all duration-150 flex flex-col justify-between hover:translate-y-[-2px] hover:border-[#ff3e1d]/50 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-lg bg-[#ffe5e0] text-[#ff3e1d] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <AlertTriangle className="size-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#ffe5e0] text-[#ff3e1d] flex items-center gap-1">
              <span>{initialData.criticalStockParts.length} SKU</span>
              <ChevronRight className="size-3" />
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a1acb8] mb-1">
              Peringatan Stok Kritis
            </p>
            <h3 className="text-2xl font-bold font-sans text-[#ff3e1d]">
              {initialData.criticalStockParts.length} Komponen
            </h3>
            <p className="text-xs text-[#8592a3] mt-1 group-hover:text-[#002D62] transition-colors flex items-center gap-1">
              Klik untuk buka daftar restok cepat &rarr;
            </p>
          </div>
        </div>

        {/* Widget 4: Bagi Hasil Teknisi with Direct Payroll Link */}
        <div className="rounded-xl bg-white dark:bg-[#2b2c40] p-5 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] border border-[#eceef1] dark:border-[#444564] transition-all duration-150 flex flex-col justify-between hover:translate-y-[-2px]">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-lg bg-[#fff2d6] text-[#ffab00] flex items-center justify-center shadow-xs">
              <Percent className="size-5" />
            </div>
            <Link href="/dashboard/commissions">
              <Button
                variant="ghost"
                size="xs"
                className="text-xs font-semibold text-[#002D62] hover:bg-[#E6EDF6] h-7 px-2"
              >
                Lihat Payroll <ExternalLink className="size-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a1acb8] mb-1">
              Komisi Siap Cair (Payroll)
            </p>
            <h3 className="text-2xl font-bold font-sans text-[#384551] dark:text-[#dbdcff]">
              {formatCurrency(pendingPayout)}
            </h3>
            <p className="text-xs text-[#8592a3] mt-1">
              Bagi hasil {initialData.technicians.length} teknisi aktif bulan ini
            </p>
          </div>
        </div>
      </div>

      {/* 3. RICH VISUALIZATION WIDGETS (RECHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 Cols): Multi-tab Revenue Dynamics Area Chart */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="border-b border-[#eceef1] dark:border-[#444564] pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                    <TrendingUp className="size-4 text-[#002D62]" /> Dinamika Pendapatan &amp; Arus Kas
                  </CardTitle>
                  <CardDescription className="text-xs text-[#8592a3]">
                    Visualisasi pergerakan kas masuk versus kas keluar atau perbandingan sumber profit.
                  </CardDescription>
                </div>

                {/* Chart Tab Switcher */}
                <div className="flex items-center bg-[#f5f5f9] dark:bg-[#232333] p-1 rounded-lg border border-[#eceef1] dark:border-[#444564]">
                  <button
                    type="button"
                    onClick={() => setRevenueChartTab("cashflow")}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                      revenueChartTab === "cashflow"
                        ? "bg-[#002D62] text-white shadow-xs"
                        : "text-[#566a7f] hover:text-[#384551]"
                    }`}
                  >
                    Arus Kas (In / Out)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevenueChartTab("sources")}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                      revenueChartTab === "sources"
                        ? "bg-[#002D62] text-white shadow-xs"
                        : "text-[#566a7f] hover:text-[#384551]"
                    }`}
                  >
                    Servis vs Sparepart
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5 pb-2">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCashIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={SNEAT_COLORS.primary} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={SNEAT_COLORS.primary} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorCashOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={SNEAT_COLORS.danger} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={SNEAT_COLORS.danger} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={SNEAT_COLORS.info} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={SNEAT_COLORS.info} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={SNEAT_COLORS.success} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={SNEAT_COLORS.success} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f4" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke={SNEAT_COLORS.textMuted}
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: SNEAT_COLORS.borderSubtle }}
                    />
                    <YAxis
                      stroke={SNEAT_COLORS.textMuted}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-xl bg-white dark:bg-[#2b2c40] p-3 shadow-[0_4px_14px_0_rgba(67,89,113,0.16)] border border-[#eceef1] dark:border-[#444564] text-xs space-y-1.5 min-w-[170px]">
                              <p className="font-bold text-[#384551] dark:text-[#dbdcff] border-b border-[#eceef1] pb-1">
                                Periode: {label}
                              </p>
                              {payload.map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-3">
                                  <span className="flex items-center gap-1.5 text-[#8592a3]">
                                    <span
                                      className="size-2 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    {entry.name}:
                                  </span>
                                  <span className="font-bold font-mono text-[#384551] dark:text-[#dbdcff]">
                                    {formatCurrency(Number(entry.value))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {revenueChartTab === "cashflow" ? (
                      <>
                        <Area
                          type="monotone"
                          dataKey="cashIn"
                          name="Kas Masuk (In)"
                          stroke={SNEAT_COLORS.primary}
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorCashIn)"
                        />
                        <Area
                          type="monotone"
                          dataKey="cashOut"
                          name="Pengeluaran (Out)"
                          stroke={SNEAT_COLORS.danger}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorCashOut)"
                        />
                      </>
                    ) : (
                      <>
                        <Area
                          type="monotone"
                          dataKey="serviceRevenue"
                          name="Jasa Servis"
                          stroke={SNEAT_COLORS.info}
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorService)"
                        />
                        <Area
                          type="monotone"
                          dataKey="sparepartRevenue"
                          name="Penjualan Suku Cadang"
                          stroke={SNEAT_COLORS.success}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPart)"
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend Summary */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-[#eceef1] dark:border-[#444564] text-xs">
                {revenueChartTab === "cashflow" ? (
                  <>
                    <span className="flex items-center gap-1.5 font-medium text-[#566a7f]">
                      <span className="size-2.5 rounded-full bg-[#002D62]" /> Kas Masuk Bersih
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-[#566a7f]">
                      <span className="size-2.5 rounded-full bg-[#ff3e1d]" /> Beban Kas Keluar
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 font-medium text-[#566a7f]">
                      <span className="size-2.5 rounded-full bg-[#03c3ec]" /> Jasa Teknisi (~62%)
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-[#566a7f]">
                      <span className="size-2.5 rounded-full bg-[#00A896]" /> Margin Sparepart (~38%)
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right (4 Cols): Service Bottleneck Funnel (Donut Chart) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="border-b border-[#eceef1] dark:border-[#444564] pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                    <Clock className="size-4 text-[#ffab00]" /> Corong Status Servis
                  </CardTitle>
                  <CardDescription className="text-xs text-[#8592a3]">
                    Klik segmen untuk filter tabel antrean workshop.
                  </CardDescription>
                </div>
                {funnelFilter && (
                  <button
                    type="button"
                    onClick={() => setFunnelFilter(null)}
                    className="text-[11px] text-[#002D62] underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4 pb-2">
              <div className="h-56 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={funnelChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      onClick={(entry: any) => {
                        const targetKey = String(entry?.key || entry?.payload?.key || "");
                        if (targetKey) {
                          setFunnelFilter(funnelFilter === targetKey ? null : targetKey);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {funnelChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={funnelFilter === entry.key ? "#384551" : "transparent"}
                          strokeWidth={funnelFilter === entry.key ? 2 : 0}
                          className="transition-all hover:opacity-80"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="rounded-lg bg-white dark:bg-[#2b2c40] p-2 shadow-md border border-[#eceef1] text-xs font-semibold text-[#384551]">
                              <p className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full" style={{ backgroundColor: data.payload.color }} />
                                {data.name}: <span className="font-bold">{data.value} unit</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-[#8592a3]">Total Unit</span>
                  <span className="text-xl font-black text-[#384551] dark:text-[#dbdcff]">
                    {funnelChartData.reduce((a, b) => a + b.value, 0)}
                  </span>
                </div>
              </div>

              {/* Clickable Status Filter Tags */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 text-xs">
                {funnelChartData.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFunnelFilter(funnelFilter === item.key ? null : item.key)}
                    className={`flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
                      funnelFilter === item.key
                        ? "border-[#002D62] bg-[#E6EDF6] text-[#002D62] font-bold"
                        : "border-[#eceef1] dark:border-[#444564] text-[#566a7f] hover:bg-[#f5f5f9]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-[11px] truncate">
                      <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-[11px] ml-1">{item.value}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3B. QUICK INTERACTIVE FUNNEL DRILL-DOWN TABLE */}
      {funnelFilter && (
        <Card className="overflow-hidden border-[#002D62]/40 shadow-xs">
          <CardHeader className="bg-[#E6EDF6]/30 dark:bg-[#002D62]/10 py-3 px-5 border-b border-[#eceef1]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                <Wrench className="size-4 text-[#002D62]" /> Unit Tertahan pada Tahap:{" "}
                <Badge variant="primary" className="text-xs">
                  {FUNNEL_CONFIG[funnelFilter]?.label || funnelFilter}
                </Badge>
              </CardTitle>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setFunnelFilter(null)}
                className="text-xs text-[#8592a3] hover:text-[#384551]"
              >
                Tutup Filter
              </Button>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Tiket</TableHead>
                <TableHead>Perangkat</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Teknisi</TableHead>
                <TableHead>Lama Antrean</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBottlenecks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-[#8592a3]">
                    Tidak ada unit aktif pada tahapan ini.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBottlenecks.map((b) => (
                  <TableRow key={b.id} className="text-xs">
                    <TableCell className="font-semibold text-[#384551] dark:text-[#dbdcff]">
                      {b.ticketNo}
                    </TableCell>
                    <TableCell className="text-[#566a7f] font-medium">{b.device}</TableCell>
                    <TableCell className="text-[#8592a3]">{b.customerName}</TableCell>
                    <TableCell className="text-[#566a7f]">{b.technicianName}</TableCell>
                    <TableCell>
                      <Badge variant="warning" className="text-[10px]">
                        {b.hoursInWorkshop} jam di workshop
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`/dashboard/repairs/${b.id}`}>
                        <Button size="xs" variant="outline" className="text-[#002D62] border-[#E6EDF6]">
                          Buka Detail
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 4. PERFORMANCE & LOGISTICS (TECHNICIAN LEADERBOARD & FAST-MOVING PARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (6 Cols): Technician Leaderboard */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="border-b border-[#eceef1] dark:border-[#444564] pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                    <Award className="size-4 text-[#ffab00]" /> Peringkat Produktivitas Teknisi
                  </CardTitle>
                  <CardDescription className="text-xs text-[#8592a3]">
                    Berdasarkan jumlah unit selesai &amp; rating kelulusan QC.
                  </CardDescription>
                </div>
                <Badge variant="primary" className="text-xs">
                  {initialData.technicians.length} Teknisi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#eceef1] dark:divide-[#444564]">
                {initialData.technicians.map((tech, idx) => {
                  const rankColor =
                    idx === 0
                      ? "bg-[#ffab00] text-white shadow-xs"
                      : idx === 1
                      ? "bg-[#8592a3] text-white"
                      : idx === 2
                      ? "bg-[#c48d42] text-white"
                      : "bg-[#f5f5f9] text-[#566a7f]";

                  return (
                    <div
                      key={tech.id}
                      className="p-3.5 px-5 flex items-center justify-between hover:bg-[#f5f5f9]/50 dark:hover:bg-[#232333]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`size-6 rounded-full flex items-center justify-center font-bold text-xs ${rankColor}`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-xs text-[#384551] dark:text-[#dbdcff]">{tech.name}</p>
                          <p className="text-[11px] text-[#8592a3]">{tech.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 text-right">
                        <div>
                          <span className="font-bold text-xs text-[#384551] dark:text-[#dbdcff] block">
                            {tech.completedUnits} Unit
                          </span>
                          <span className="text-[10px] text-[#00A896] font-semibold flex items-center justify-end gap-0.5">
                            <ShieldCheck className="size-3" /> QC {tech.qcPassRate}%
                          </span>
                        </div>
                        <div className="min-w-[90px]">
                          <span className="font-bold text-xs text-[#002D62] block">
                            {formatCurrency(tech.laborGenerated)}
                          </span>
                          <span className="text-[10px] text-[#8592a3]">Kontribusi Jasa</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right (6 Cols): Top Fast-Moving Spareparts Horizontal Bar */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="border-b border-[#eceef1] dark:border-[#444564] pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                    <Layers className="size-4 text-[#03c3ec]" /> Suku Cadang Terlaris &amp; Paling Menguntungkan
                  </CardTitle>
                  <CardDescription className="text-xs text-[#8592a3]">
                    Evaluasi perputaran inventaris untuk proyeksi restok.
                  </CardDescription>
                </div>

                <div className="flex items-center bg-[#f5f5f9] dark:bg-[#232333] p-1 rounded-lg border border-[#eceef1]">
                  <button
                    type="button"
                    onClick={() => setPartsChartTab("volume")}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                      partsChartTab === "volume"
                        ? "bg-[#002D62] text-white shadow-xs"
                        : "text-[#566a7f] hover:text-[#384551]"
                    }`}
                  >
                    Volume (Pcs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartsChartTab("profit")}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                      partsChartTab === "profit"
                        ? "bg-[#002D62] text-white shadow-xs"
                        : "text-[#566a7f] hover:text-[#384551]"
                    }`}
                  >
                    Profit (Rp)
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 pb-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={fastMovingPartsData}
                    margin={{ top: 5, right: 25, left: 35, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f2f4" />
                    <XAxis
                      type="number"
                      stroke={SNEAT_COLORS.textMuted}
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => (partsChartTab === "volume" ? `${val} pcs` : `${(val / 1000000).toFixed(1)}M`)}
                    />
                    <YAxis
                      dataKey="sku"
                      type="category"
                      stroke={SNEAT_COLORS.textMuted}
                      fontSize={10}
                      tickLine={false}
                      axisLine={{ stroke: SNEAT_COLORS.borderSubtle }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-xl bg-white dark:bg-[#2b2c40] p-3 shadow-md border border-[#eceef1] text-xs space-y-1">
                              <p className="font-bold text-[#384551]">{d.name}</p>
                              <p className="text-[#8592a3]">SKU: {d.sku}</p>
                              <p className="font-semibold text-[#002D62]">Terjual: {d.volume} unit</p>
                              <p className="font-semibold text-[#00A896]">Laba Kotor: {formatCurrency(d.profit)} ({d.margin})</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey={partsChartTab === "volume" ? "volume" : "profit"}
                      fill={partsChartTab === "volume" ? SNEAT_COLORS.primary : SNEAT_COLORS.success}
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. REAL-TIME OPERATIONAL RADAR (BOTTOM GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (6 Cols): Live Activity Feed Mini-Timeline */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="border-b border-[#eceef1] dark:border-[#444564] pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                  <Activity className="size-4 text-[#002D62]" /> Log Aktivitas Operasional Langsung
                </CardTitle>
                <span className="text-[11px] text-[#8592a3]">Sync: {lastSyncTime}</span>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                {activityFeed.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3 relative">
                      {idx !== activityFeed.length - 1 && (
                        <span className="absolute left-4 top-8 -bottom-4 w-0.5 bg-[#eceef1] dark:bg-[#444564]" />
                      )}
                      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${item.color}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-xs text-[#384551] dark:text-[#dbdcff]">{item.title}</p>
                          <span className="text-[10px] text-[#8592a3]">{item.time}</span>
                        </div>
                        <p className="text-xs text-[#8592a3] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right (6 Cols): Unit Mengendap Alert Box (>48 Jam) */}
        <div className="lg:col-span-6">
          <Card className="h-full border-[#ffab00]/40">
            <CardHeader className="border-b border-[#eceef1] dark:border-[#444564] pb-3 bg-[#fff2d6]/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                    <Clock className="size-4 text-[#ffab00]" /> Radar Unit Mengendap (&gt; 48 Jam)
                  </CardTitle>
                  <CardDescription className="text-xs text-[#8592a3]">
                    Perangkat yang belum mengalami progres status untuk pencegahan komplain.
                  </CardDescription>
                </div>
                <Badge variant="warning" className="text-xs">
                  {initialData.stuckUnits.length} Unit
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#eceef1] dark:divide-[#444564]">
                {initialData.stuckUnits.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8592a3]">
                    Hebat! Tidak ada unit yang mengendap lebih dari 48 jam di workshop saat ini.
                  </div>
                ) : (
                  initialData.stuckUnits.map((unit) => {
                    const waClean = unit.customerPhone.replace(/[^0-9]/g, "");
                    const waText = encodeURIComponent(
                      `Halo Kak ${unit.customerName}, kami dari Beres.in ingin menginformasikan update status servis perangkat ${unit.device} (No. Tiket: ${unit.ticketNo}). Terima kasih.`
                    );

                    return (
                      <div
                        key={unit.id}
                        className="p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f5f5f9]/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#384551] dark:text-[#dbdcff]">
                              {unit.ticketNo}
                            </span>
                            <SneatStatusBadge status={unit.status} />
                            <Badge variant="danger" className="text-[10px] font-bold">
                              {unit.stuckHours} jam
                            </Badge>
                          </div>
                          <p className="text-xs font-medium text-[#566a7f]">
                            {unit.device} &bull; <span className="text-[#8592a3]">{unit.customerName}</span>
                          </p>
                          <p className="text-[11px] text-[#8592a3] line-clamp-1">
                            Keluhan: {unit.complaint}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`https://wa.me/${waClean}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="xs"
                              className="gap-1 text-xs bg-[#00A896] hover:bg-[#64c92e] text-white shadow-xs"
                            >
                              <MessageCircle className="size-3" /> Hubungi Klien
                            </Button>
                          </a>
                          <Link href={`/dashboard/repairs/${unit.id}`}>
                            <Button size="xs" variant="outline" className="text-xs text-[#002D62] border-[#E6EDF6]">
                              Buka Tiket
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QUICK MODAL / DRAWER: STOK KRITIS REORDER DIALOG */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-[#384551] dark:text-[#dbdcff]">
              <AlertTriangle className="size-5 text-[#ff3e1d]" />
              Daftar Suku Cadang Kritis &amp; Rekomendasi Restok
            </DialogTitle>
            <DialogDescription className="text-xs text-[#8592a3]">
              Komponen yang telah mencapai batas minimum atau stok habis (0 pcs) di inventaris Beres.in.
            </DialogDescription>
          </DialogHeader>

          <div className="border border-[#eceef1] dark:border-[#444564] rounded-xl overflow-hidden my-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode SKU</TableHead>
                  <TableHead>Nama Sparepart</TableHead>
                  <TableHead className="text-center">Sisa Stok</TableHead>
                  <TableHead className="text-center">Limit Batas</TableHead>
                  <TableHead className="text-right">Harga HPP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialData.criticalStockParts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-xs text-[#8592a3]">
                      Semua stok suku cadang dalam kondisi aman.
                    </TableCell>
                  </TableRow>
                ) : (
                  initialData.criticalStockParts.map((part) => (
                    <TableRow key={part.id} className="text-xs">
                      <TableCell className="font-semibold text-[#384551]">{part.sku}</TableCell>
                      <TableCell>
                        <p className="font-medium text-[#566a7f]">{part.name}</p>
                        <p className="text-[10px] text-[#8592a3]">{part.brand}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        {part.stock === 0 ? (
                          <Badge variant="danger" className="text-[10px]">Habis (0)</Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px]">Sisa {part.stock}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold text-[#8592a3]">
                        {part.minStockAlert} pcs
                      </TableCell>
                      <TableCell className="text-right font-medium text-[#566a7f]">
                        {formatCurrency(part.buyPrice)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <span className="text-xs text-[#8592a3]">
              Total: {initialData.criticalStockParts.length} SKU mendesak restok
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStockDialogOpen(false)}
                className="text-xs"
              >
                Tutup
              </Button>
              <Link href="/dashboard/inventory">
                <Button
                  size="sm"
                  className="text-xs bg-[#002D62] hover:bg-[#001F44] text-white shadow-xs gap-1.5"
                >
                  <Package className="size-3.5" /> Buka Manajemen Inventaris
                </Button>
              </Link>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

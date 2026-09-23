"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Smartphone,
  User,
  Printer,
  ChevronRight,
} from "lucide-react";
import { SneatStatusBadge } from "@/components/sneat-status-badge";

export type BoardTicket = {
  id: string;
  ticketNo: string;
  deviceBrand: string;
  deviceModel: string;
  imeiSn: string | null;
  complaint: string;
  status: "RECEIVED" | "DIAGNOSIS" | "PROGRESS" | "QC" | "READY" | "DELIVERED";
  estCost: number;
  downPayment: number;
  laborCost: number;
  totalCost: number;
  createdAt: Date | string;
  customer: {
    name: string;
    phone: string;
  };
  technician: {
    id: string;
    name: string;
  } | null;
  partsUsed: Array<{
    id: string;
    quantity: number;
  }>;
};

interface TechnicianItem {
  id: string;
  name: string;
}

const COLUMNS: Array<{
  key: BoardTicket["status"];
  label: string;
  chipClass: string;
}> = [
  { key: "RECEIVED", label: "Diterima", chipClass: "bg-[#d7f5fc] text-[#03c3ec]" },
  { key: "DIAGNOSIS", label: "Diagnosis", chipClass: "bg-[#fff2d6] text-[#ffab00]" },
  { key: "PROGRESS", label: "Pengerjaan", chipClass: "bg-[#E6EDF6] text-[#002D62]" },
  { key: "QC", label: "Quality Check", chipClass: "bg-[#E6EDF6] text-[#001F44]" },
  { key: "READY", label: "Siap Diambil", chipClass: "bg-[#E6F6F4] text-[#00A896]" },
  { key: "DELIVERED", label: "Diserahkan", chipClass: "bg-[#ebeef0] text-[#8592a3]" },
];

export function RepairsBoard({
  initialTickets,
  technicians,
}: {
  initialTickets: BoardTicket[];
  technicians: TechnicianItem[];
}) {
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [techFilter, setTechFilter] = React.useState<string>("ALL");

  const filteredTickets = React.useMemo(() => {
    return initialTickets.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (techFilter !== "ALL" && t.technician?.id !== techFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.ticketNo.toLowerCase().includes(q) ||
          t.customer.name.toLowerCase().includes(q) ||
          t.customer.phone.toLowerCase().includes(q) ||
          t.deviceBrand.toLowerCase().includes(q) ||
          t.deviceModel.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [initialTickets, statusFilter, techFilter, searchQuery]);


  return (
    <div className="space-y-6">
      {/* Top Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#384551] dark:text-[#dbdcff]">
            Papan Order Servis (Kanban)
          </h1>
          <p className="text-xs text-[#a1acb8] dark:text-[#7071a4]">
            Monitoring pergerakan unit servis, penugasan teknisi, dan status pengerjaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#eceef1] rounded-lg p-1 bg-white dark:bg-[#2b2c40] shadow-xs">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="xs"
              onClick={() => setViewMode("kanban")}
              className="gap-1 text-xs"
            >
              <LayoutGrid className="size-3.5" /> Kanban
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="xs"
              onClick={() => setViewMode("table")}
              className="gap-1 text-xs"
            >
              <List className="size-3.5" /> Tabel
            </Button>
          </div>

          <Link href="/dashboard/repairs/new">
            <Button size="sm" className="gap-1.5 font-semibold text-xs">
              <Plus className="size-4" /> Intake Servis Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-[#2b2c40] p-4 rounded-xl border border-[#eceef1] dark:border-[#444564] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#a1acb8]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No Tiket, Pelanggan, atau Tipe Device..."
            className="pl-9 h-9 text-xs border-[#d9dee3]"
          />
        </div>

        {/* Filter Status */}
        <div>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              if (val) setStatusFilter(val);
            }}
          >
            <SelectTrigger className="w-full h-9 text-xs border-[#d9dee3]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status ({initialTickets.length})</SelectItem>
              {COLUMNS.map((col) => (
                <SelectItem key={col.key} value={col.key}>
                  {col.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Technician */}
        <div>
          <Select
            value={techFilter}
            onValueChange={(val) => {
              if (val) setTechFilter(val);
            }}
          >
            <SelectTrigger className="w-full h-9 text-xs border-[#d9dee3]">
              <SelectValue placeholder="Semua Teknisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Teknisi</SelectItem>
              {technicians.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.status === col.key);

            return (
              <div
                key={col.key}
                className="bg-[#f5f5f9]/70 dark:bg-[#2b2c40]/40 rounded-xl p-3 border border-[#eceef1] dark:border-[#444564] space-y-3 min-h-[500px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#eceef1] dark:border-[#444564]">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${col.chipClass}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#8592a3] bg-white dark:bg-[#2b2c40] px-2 py-0.5 rounded-md shadow-2xs border border-[#eceef1]">
                    {colTickets.length}
                  </span>
                </div>

                {/* Tickets Column Cards */}
                <div className="space-y-3 flex-1">
                  {colTickets.length === 0 ? (
                    <div className="text-center py-12 text-[11px] text-[#a1acb8]">
                      Tidak ada unit
                    </div>
                  ) : (
                    colTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#2b2c40] border border-[#eceef1] dark:border-[#444564] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-2 hover:translate-y-[-2px] transition-all duration-150 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#002D62]">
                            {ticket.ticketNo}
                          </span>
                          <Link href={`/tracking/${ticket.ticketNo}/print`} target="_blank">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title="Cetak SPK"
                              className="text-[#a1acb8] hover:text-[#002D62] h-6 w-6"
                            >
                              <Printer className="size-3" />
                            </Button>
                          </Link>
                        </div>

                        <div className="text-xs">
                          <p className="font-bold flex items-center gap-1.5 text-[#384551] dark:text-[#dbdcff]">
                            <Smartphone className="size-3 text-[#002D62] shrink-0" />
                            <span className="truncate">{ticket.deviceBrand} {ticket.deviceModel}</span>
                          </p>
                          <p className="text-[#8592a3] flex items-center gap-1.5 mt-0.5 text-[11px]">
                            <User className="size-3 shrink-0 text-[#a1acb8]" />
                            <span className="truncate">{ticket.customer.name}</span>
                          </p>
                        </div>

                        <p className="text-[11px] text-[#8592a3] line-clamp-2 bg-[#f5f5f9] dark:bg-[#232333] p-2 rounded-lg border border-[#eceef1]">
                          {ticket.complaint}
                        </p>

                        <div className="pt-2 border-t border-[#f0f2f4] dark:border-[#444564] flex items-center justify-between text-[11px]">
                          <span className="text-[#a1acb8] truncate max-w-[90px]">
                            {ticket.technician?.name || "Unassigned"}
                          </span>
                          <span className="font-mono font-bold text-[#384551] dark:text-[#dbdcff]">
                            {formatCurrency(ticket.totalCost || ticket.estCost)}
                          </span>
                        </div>

                        <Link href={`/dashboard/repairs/${ticket.id}`} className="block pt-1">
                          <Button
                            variant="outline"
                            size="xs"
                            className="w-full justify-between text-[11px] font-medium h-7 border-[#d9dee3] group-hover:border-[#002D62] group-hover:bg-[#E6EDF6] group-hover:text-[#002D62] transition-colors"
                          >
                            <span>Buka Workshop</span>
                            <ChevronRight className="size-3" />
                          </Button>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE LIST VIEW */}
      {viewMode === "table" && (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No Tiket</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Perangkat</TableHead>
                <TableHead>Keluhan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Teknisi</TableHead>
                <TableHead className="text-right">Biaya / DP</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-[#a1acb8] text-xs">
                    Tidak ada tiket yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono font-bold text-xs text-[#002D62]">
                      {t.ticketNo}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-xs text-[#384551] dark:text-[#dbdcff]">{t.customer.name}</p>
                      <p className="text-[11px] text-[#8592a3] font-mono">{t.customer.phone}</p>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-semibold">{t.deviceBrand}</span> {t.deviceModel}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-[#8592a3]">
                      {t.complaint}
                    </TableCell>
                    <TableCell>
                      <SneatStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="text-xs text-[#566a7f]">{t.technician?.name || "-"}</TableCell>
                    <TableCell className="text-right text-xs">
                      <p className="font-mono font-bold text-[#384551] dark:text-[#dbdcff]">
                        {formatCurrency(t.totalCost || t.estCost)}
                      </p>
                      {t.downPayment > 0 && (
                        <p className="text-[10px] text-[#00A896] font-mono font-semibold">
                          DP: {formatCurrency(t.downPayment)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/repairs/${t.id}`}>
                          <Button size="xs" variant="outline" className="border-[#d9dee3]">
                            Buka
                          </Button>
                        </Link>
                        <Link href={`/tracking/${t.ticketNo}/print`} target="_blank">
                          <Button size="icon-xs" variant="ghost" className="text-[#8592a3] hover:text-[#002D62]">
                            <Printer className="size-3" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

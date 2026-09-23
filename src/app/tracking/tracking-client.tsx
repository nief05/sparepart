"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getRepairTracking,
  type TrackingResult,
} from "@/app/actions/tracking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
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
  Search,
  Wrench,
  Printer,
  Smartphone,
  CheckCircle2,
  Clock,
  Cpu,
  ShieldCheck,
  PackageCheck,
  AlertCircle,
  ArrowRight,
  ReceiptText,
} from "lucide-react";

const STATUS_STEPS = [
  { key: "RECEIVED", label: "Diterima", icon: Clock, desc: "Unit masuk & antrean servis" },
  { key: "DIAGNOSIS", label: "Diagnosis", icon: Search, desc: "Pemeriksaan teknisi" },
  { key: "PROGRESS", label: "Perbaikan", icon: Wrench, desc: "Pengerjaan & ganti suku cadang" },
  { key: "QC", label: "Quality Check", icon: ShieldCheck, desc: "Pengujian fungsi perangkat" },
  { key: "READY", label: "Siap Ambil", icon: PackageCheck, desc: "Selesai, siap diambil pelanggan" },
  { key: "DELIVERED", label: "Diserahkan", icon: CheckCircle2, desc: "Unit telah diterima pelanggan" },
];

function getStatusBadge(status: TrackingResult["status"]) {
  return <SneatStatusBadge status={status} />;
}

export function TrackingClient() {
  const searchParams = useSearchParams();
  const initialTicket = searchParams.get("ticket") || searchParams.get("query") || "";

  const [query, setQuery] = React.useState(initialTicket);
  const [loading, setLoading] = React.useState(false);
  const [tickets, setTickets] = React.useState<TrackingResult[] | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSearch = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    const res = await getRepairTracking(searchQuery);

    if (res.success && res.tickets && res.tickets.length > 0) {
      setTickets(res.tickets);
    } else {
      setTickets(null);
      setErrorMessage(res.message || "Data servis tidak ditemukan.");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (initialTicket) {
      handleSearch(initialTicket);
    }
  }, [initialTicket, handleSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };


  return (
    <div className="space-y-8">
      {/* Search Input Section */}
      <Card className="border shadow-xs">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-[#384551] dark:text-[#dbdcff]">Lacak Status Servis Beres.in</CardTitle>
          <CardDescription>
            Masukkan Nomor Tiket Servis (contoh: <span className="font-mono font-medium">BRS-20260908-0001</span>) atau Nomor Handphone WhatsApp Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#a1acb8]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nomor Tiket (BRS-...) atau No. HP (08...)"
                className="pl-9 h-11 text-base border-[#d9dee3]"
              />
            </div>
            <Button type="submit" disabled={loading} className="h-11 px-6 font-bold bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_8px_0_rgba(0,45,98,0.25)]">
              {loading ? "Mencari..." : "Cek Status"}
            </Button>
          </form>

          {/* Quick sample ticket pill */}
          <div className="text-center mt-3 text-xs text-muted-foreground">
            Contoh nomor tiket uji coba:{" "}
            <button
              type="button"
              onClick={() => {
                setQuery("BRS-20260908-0001");
                handleSearch("BRS-20260908-0001");
              }}
              className="text-[#00A896] underline font-mono hover:text-[#008F80] font-bold"
            >
              BRS-20260908-0001
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Pencarian Gagal</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Results List */}
      {tickets && tickets.length > 0 && (
        <div className="space-y-6">
          {tickets.map((t) => {
            const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === t.status);

            return (
              <Card key={t.id} className="border shadow-sm overflow-hidden">
                {/* Header Ticket Banner */}
                <div className="bg-zinc-100 dark:bg-zinc-900 p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Nomor Tiket Servis
                      </span>
                      {getStatusBadge(t.status)}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-mono font-bold mt-1">
                      {t.ticketNo}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Diterima pada{" "}
                      {new Date(t.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/tracking/${t.ticketNo}/print`}>
                      <Button variant="outline" className="gap-2">
                        <Printer className="size-4" /> Cetak SPK / Nota
                      </Button>
                    </Link>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Visual Status Progression Tracker */}
                  <div className="py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Alur Pengerjaan Servis
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const Icon = step.icon;

                        return (
                          <div
                            key={step.key}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              isCurrent
                                ? "bg-primary/10 border-primary text-primary font-semibold shadow-xs"
                                : isDone
                                ? "bg-muted/40 border-muted text-muted-foreground"
                                : "opacity-40 border-dashed"
                            }`}
                          >
                            <div className="flex justify-center mb-1.5">
                              <Icon className={`size-5 ${isCurrent ? "text-primary" : ""}`} />
                            </div>
                            <p className="text-xs font-medium">{step.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                              {step.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Device & Customer Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 border rounded-lg p-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                        <Smartphone className="size-3.5" /> Identitas Perangkat
                      </p>
                      <div className="text-sm">
                        <p className="font-semibold text-base">
                          {t.deviceBrand} {t.deviceModel}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          IMEI / Serial Number:{" "}
                          <span className="font-mono">{t.imeiSn || "-"}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Teknisi Penanggung Jawab:{" "}
                          <span className="font-medium text-foreground">
                            {t.technician?.name || "Tim Teknisi Beres.in"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                        <ReceiptText className="size-3.5" /> Data Pelanggan
                      </p>
                      <div className="text-sm">
                        <p className="font-semibold text-base">{t.customer.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {t.customer.phone}
                        </p>
                        {t.customer.address && (
                          <p className="text-xs text-muted-foreground truncate">
                            {t.customer.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis & Notes */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      Keluhan &amp; Catatan Diagnosis Teknisi
                    </p>
                    <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-sm border font-sans">
                      {t.complaint}
                    </div>
                  </div>

                  {/* Replaced Parts (if any) */}
                  {t.partsUsed.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                        <Cpu className="size-3.5" /> Suku Cadang yang Digunakan
                      </p>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nama Sparepart</TableHead>
                              <TableHead>Brand</TableHead>
                              <TableHead className="text-center">Jumlah</TableHead>
                              <TableHead className="text-right">Harga Satuan</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {t.partsUsed.map((part) => (
                              <TableRow key={part.id}>
                                <TableCell className="font-medium">{part.sparepart.name}</TableCell>
                                <TableCell className="text-muted-foreground">{part.sparepart.brand}</TableCell>
                                <TableCell className="text-center">{part.quantity}</TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatCurrency(part.price)}
                                </TableCell>
                                <TableCell className="text-right font-mono font-medium">
                                  {formatCurrency(part.price * part.quantity)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Financial Summary */}
                  <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Kebijakan Pembayaran:</p>
                      <p>Pelunasan dilakukan saat pengambilan unit fisik di workshop.</p>
                    </div>

                    <div className="w-full sm:w-72 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-lg border space-y-1.5 text-sm">
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Estimasi / Total Biaya:</span>
                        <span className="font-mono">{formatCurrency(t.totalCost || t.estCost)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Uang Muka (DP Terbayar):</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          - {formatCurrency(t.downPayment)}
                        </span>
                      </div>
                      <div className="border-t pt-1.5 flex justify-between font-bold text-base">
                        <span>Sisa Pembayaran:</span>
                        <span className="font-mono text-primary">
                          {formatCurrency(t.remainingBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

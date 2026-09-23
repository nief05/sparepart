"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateTicketStatusAction,
  addPartToTicketAction,
  updateLaborFeeAction,
} from "@/app/actions/repairs";
import { RepairStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { SneatStatusBadge } from "@/components/sneat-status-badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wrench,
  Smartphone,
  User,
  Printer,
  ArrowLeft,
  Plus,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
  Lock,
  Cpu,
  Receipt,
  FileText,
} from "lucide-react";

export type TicketDetail = {
  id: string;
  ticketNo: string;
  deviceBrand: string;
  deviceModel: string;
  imeiSn: string | null;
  passcode: string | null;
  complaint: string;
  status: RepairStatus;
  estCost: number;
  downPayment: number;
  laborCost: number;
  totalCost: number;
  diagnosisNotes: string | null;
  createdAt: Date | string;
  customer: {
    name: string;
    phone: string;
    address: string | null;
  };
  technician: {
    id: string;
    name: string;
    email: string;
  } | null;
  partsUsed: Array<{
    id: string;
    quantity: number;
    price: number;
    sparepart: {
      id: string;
      sku: string;
      name: string;
      brand: string;
    };
  }>;
};

export type AvailableSparepart = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  sellPrice: number;
  stock: number;
};

export function WorkshopClient({
  ticket: initialTicket,
  availableParts,
}: {
  ticket: TicketDetail;
  availableParts: AvailableSparepart[];
}) {
  const router = useRouter();
  const [ticket, setTicket] = React.useState<TicketDetail>(initialTicket);

  // Status & notes state
  const [selectedStatus, setSelectedStatus] = React.useState<RepairStatus>(initialTicket.status);
  const [diagnosisNotes, setDiagnosisNotes] = React.useState<string>(initialTicket.diagnosisNotes || "");
  const [statusLoading, setStatusLoading] = React.useState(false);

  // Add part dialog state
  const [partDialogOpen, setPartDialogOpen] = React.useState(false);
  const [selectedPartId, setSelectedPartId] = React.useState<string>(availableParts[0]?.id || "");
  const [partQty, setPartQty] = React.useState<number>(1);
  const [partLoading, setPartLoading] = React.useState(false);
  const [partError, setPartError] = React.useState<string | null>(null);

  // Labor fee state
  const [laborInput, setLaborInput] = React.useState<number>(initialTicket.laborCost);
  const [laborLoading, setLaborLoading] = React.useState(false);

  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);


  const partsSubtotal = ticket.partsUsed.reduce(
    (acc, p) => acc + p.price * p.quantity,
    0
  );

  const finalBalance = Math.max(0, ticket.totalCost - ticket.downPayment);

  // Update Status Action
  const handleUpdateStatus = async () => {
    setStatusLoading(true);
    setFeedback(null);
    const res = await updateTicketStatusAction(ticket.id, selectedStatus, diagnosisNotes);
    if (res.success && res.ticket) {
      setTicket((prev) => ({
        ...prev,
        status: res.ticket.status,
        diagnosisNotes: res.ticket.diagnosisNotes,
      }));
      setFeedback({ type: "success", message: "Status servis & catatan berhasil diperbarui." });
    } else {
      setFeedback({ type: "error", message: res.message || "Gagal memperbarui status." });
    }
    setStatusLoading(false);
  };

  // Add Part via Atomic Transaction Action
  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || partQty < 1) return;

    setPartLoading(true);
    setPartError(null);

    const res = await addPartToTicketAction(ticket.id, selectedPartId, partQty);

    if (res.success) {
      setPartDialogOpen(false);
      setFeedback({ type: "success", message: "Sparepart berhasil ditambahkan dan stok dikurangi secara otomatis!" });
      router.refresh();
      // Reload page to reflect updated ticket parts and stock
      setTimeout(() => window.location.reload(), 300);
    } else {
      setPartError(res.message || "Gagal menambahkan sparepart.");
      setPartLoading(false);
    }
  };

  // Update Labor Fee Action
  const handleUpdateLabor = async () => {
    setLaborLoading(true);
    setFeedback(null);
    const res = await updateLaborFeeAction(ticket.id, Number(laborInput));
    if (res.success && res.ticket) {
      setTicket((prev) => ({
        ...prev,
        laborCost: res.ticket.laborCost,
        totalCost: res.ticket.totalCost,
      }));
      setFeedback({ type: "success", message: "Biaya jasa & saldo akhir berhasil dihitung ulang." });
    } else {
      setFeedback({ type: "error", message: res.message || "Gagal memperbarui biaya jasa." });
    }
    setLaborLoading(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/repairs">
            <Button variant="outline" size="sm" className="gap-1.5 border-[#d9dee3] text-[#566a7f] hover:bg-[#f5f5f9]">
              <ArrowLeft className="size-4" /> Kembali
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#384551] dark:text-[#dbdcff]">{ticket.ticketNo}</h1>
              <SneatStatusBadge status={ticket.status} />
            </div>
            <p className="text-xs text-[#8592a3] mt-0.5">
              Didaftarkan {new Date(ticket.createdAt).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/tracking/${ticket.ticketNo}/print`} target="_blank">
            <Button variant="outline" size="sm" className="gap-2 border-[#d9dee3] text-[#566a7f] hover:bg-[#f5f5f9]">
              <Printer className="size-4 text-[#002D62]" /> Cetak SPK
            </Button>
          </Link>
          <a
            href={`https://wa.me/${ticket.customer.phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(ticket.customer.name)},%20update%20servis%20${encodeURIComponent(ticket.deviceBrand)}%20${encodeURIComponent(ticket.deviceModel)}%20(No.%20${ticket.ticketNo})`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="gap-2 bg-[#00A896] hover:bg-[#64c92e] text-white shadow-[0_2px_4px_0_rgba(113,221,55,0.4)]">
              WhatsApp Pelanggan
            </Button>
          </a>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg border text-sm flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid: Workshop Operations & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Status & Spareparts */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Status & Diagnosis Log Updater */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="size-4 text-primary" /> Perbarui Status Servis &amp; Catatan Teknisi
              </CardTitle>
              <CardDescription className="text-xs">
                Perubahan status akan langsung terlihat oleh pelanggan di portal tracking publik.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Tahapan Status Unit
                  </label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(val) => {
                      if (val) setSelectedStatus(val as RepairStatus);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECEIVED">RECEIVED (Unit Diterima)</SelectItem>
                      <SelectItem value="DIAGNOSIS">DIAGNOSIS (Pemeriksaan)</SelectItem>
                      <SelectItem value="PROGRESS">PROGRESS (Dalam Pengerjaan)</SelectItem>
                      <SelectItem value="QC">QC (Quality Control / Pengujian)</SelectItem>
                      <SelectItem value="READY">READY (Selesai &amp; Siap Diambil)</SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED (Sudah Diserahkan)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Teknisi Bertugas
                  </label>
                  <div className="h-8 px-3 rounded-lg border bg-muted/40 flex items-center text-xs font-medium">
                    {ticket.technician?.name || "Belum ditugaskan"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Catatan Hasil Diagnosis / Log Tindakan Teknisi
                </label>
                <Input
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="Contoh: IC Power aman, perlu pergantian flexible charging dan re-assembly."
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleUpdateStatus}
                  disabled={statusLoading}
                  size="sm"
                  className="gap-2 font-semibold bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                >
                  {statusLoading ? "Memperbarui..." : "Simpan Perubahan Status"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 2. Spareparts Usage (Atomic Stock Deduction) */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#eceef1] dark:border-[#444564]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                    <Cpu className="size-4 text-[#002D62]" /> Penggunaan Suku Cadang
                  </CardTitle>
                  <CardDescription className="text-xs text-[#8592a3]">
                    Pengambilan sparepart memotong stok inventaris secara otomatis (Prisma Atomic Transaction).
                  </CardDescription>
                </div>

                {/* Add Sparepart Modal */}
                <Dialog open={partDialogOpen} onOpenChange={setPartDialogOpen}>
                  <DialogTrigger
                    render={
                      <Button size="sm" className="gap-1.5 font-semibold bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
                        <Plus className="size-4" /> Ambil Sparepart
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Package className="size-5 text-primary" />
                        Tambah Sparepart ke Tiket Servis
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Stok di inventaris akan berkurang sesuai jumlah yang diambil.
                      </DialogDescription>
                    </DialogHeader>

                    {partError && (
                      <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs">
                        {partError}
                      </div>
                    )}

                    <form onSubmit={handleAddPart} className="space-y-3 py-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Pilih Suku Cadang (Stok Tersedia)
                        </label>
                        <Select
                          value={selectedPartId}
                          onValueChange={(val) => {
                            if (val) setSelectedPartId(val);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih sparepart..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableParts.map((part) => (
                              <SelectItem
                                key={part.id}
                                value={part.id}
                                disabled={part.stock <= 0}
                              >
                                {part.name} ({part.brand}) &bull; Sisa {part.stock} &bull; {formatCurrency(part.sellPrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Jumlah / Qty
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="99"
                          value={partQty}
                          onChange={(e) => setPartQty(Math.max(1, Number(e.target.value)))}
                          required
                        />
                      </div>

                      <DialogFooter showCloseButton>
                        <Button type="submit" disabled={partLoading}>
                          {partLoading ? "Memproses..." : "Potong Stok & Pasang"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Kode SKU</TableHead>
                      <TableHead>Nama Sparepart</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Harga Satuan</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticket.partsUsed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                          Belum ada suku cadang yang digunakan pada tiket ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      ticket.partsUsed.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs">{p.sparepart.sku}</TableCell>
                          <TableCell className="font-medium text-xs">
                            {p.sparepart.name}
                            <span className="block text-[10px] text-muted-foreground">{p.sparepart.brand}</span>
                          </TableCell>
                          <TableCell className="text-center font-bold text-xs">{p.quantity}</TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatCurrency(p.price)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-xs">
                            {formatCurrency(p.price * p.quantity)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Financial Breakdown & Device / Customer Card */}
        <div className="space-y-6">
          {/* Financial Breakdown Card */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="size-4 text-primary" /> Rincian Biaya &amp; Pelunasan
              </CardTitle>
              <CardDescription className="text-xs">
                Kalkulasi biaya suku cadang, ongkos jasa teknisi, dan sisa tagihan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Sparepart:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatCurrency(partsSubtotal)}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-medium text-muted-foreground block">
                    Biaya Jasa / Ongkos Pasang (Rp)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="10000"
                      value={laborInput || ""}
                      onChange={(e) => setLaborInput(Number(e.target.value))}
                      placeholder="0"
                      className="h-8 text-xs font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={laborLoading}
                      onClick={handleUpdateLabor}
                      className="h-8 text-xs shrink-0"
                    >
                      {laborLoading ? "..." : "Simpan"}
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between font-bold text-sm">
                    <span>Total Tagihan:</span>
                    <span className="font-mono">{formatCurrency(ticket.totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                    <span>Uang Muka (DP Terbayar):</span>
                    <span className="font-mono">- {formatCurrency(ticket.downPayment)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed pt-3">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-primary">Sisa Pelunasan</p>
                      <p className="text-[10px] text-muted-foreground">Dibayar saat unit diambil</p>
                    </div>
                    <span className="font-mono font-black text-lg text-primary">
                      {formatCurrency(finalBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device & Customer Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="size-4 text-primary" /> Data Perangkat &amp; Klien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-muted/40 space-y-1">
                <p className="font-semibold text-sm">
                  {ticket.deviceBrand} {ticket.deviceModel}
                </p>
                <p className="text-muted-foreground font-mono">
                  IMEI/SN: {ticket.imeiSn || "(Tidak ada)"}
                </p>
                <p className="text-muted-foreground font-mono flex items-center gap-1">
                  <Lock className="size-3" /> Passcode: {ticket.passcode || "(Tidak ada)"}
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <p className="font-bold text-muted-foreground uppercase text-[10px]">Keluhan Awal:</p>
                <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border text-xs leading-relaxed">
                  {ticket.complaint}
                </div>
              </div>

              <div className="border-t pt-2 space-y-1">
                <p className="font-bold text-muted-foreground uppercase text-[10px]">Data Pelanggan:</p>
                <p className="font-medium text-sm">{ticket.customer.name}</p>
                <p className="font-mono text-muted-foreground">{ticket.customer.phone}</p>
                {ticket.customer.address && (
                  <p className="text-muted-foreground text-[11px]">{ticket.customer.address}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

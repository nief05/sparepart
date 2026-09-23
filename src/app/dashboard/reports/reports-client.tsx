"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  recordExpenseAction,
  deleteExpenseAction,
  type ExpenseInput,
} from "@/app/actions/finance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { SneatStatCard } from "@/components/sneat-stat-card";
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
  DollarSign,
  TrendingUp,
  Receipt,
  Wrench,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

export type ReportSummary = {
  totalPosSales: number;
  posGrossProfit: number;
  totalServiceRevenue: number;
  totalServiceLabor: number;
  unpaidServiceBalances: number;
  totalExpenses: number;
  technicianCommission: number;
  netMargin: number;
};

export type ExpenseRecord = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date | string;
};

export type InvoiceSummary = {
  id: string;
  invoiceNo: string;
  cashierName: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date | string;
};

const EXPENSE_CATEGORIES = [
  "Operasional Toko",
  "Listrik & Internet",
  "Makan & Minum Tim",
  "Perkakas & Tool Teknisi",
  "Logistik & Ekspedisi",
  "Kemasan & Packaging",
  "Lain-lain",
];

export function ReportsClient({
  summary,
  expenses,
  recentInvoices,
}: {
  summary: ReportSummary;
  expenses: ExpenseRecord[];
  recentInvoices: InvoiceSummary[];
}) {
  const router = useRouter();

  // Expense form state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [expenseForm, setExpenseForm] = React.useState<ExpenseInput>({
    description: "",
    amount: 0,
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split("T")[0],
  });
  const [formLoading, setFormLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);


  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || expenseForm.amount <= 0) return;

    setFormLoading(true);
    setFeedback(null);

    const res = await recordExpenseAction({
      ...expenseForm,
      amount: Number(expenseForm.amount),
    });

    if (res.success) {
      setDialogOpen(false);
      setExpenseForm({
        description: "",
        amount: 0,
        category: EXPENSE_CATEGORIES[0],
        date: new Date().toISOString().split("T")[0],
      });
      setFeedback({ type: "success", message: "Pengeluaran kas operasional berhasil dicatat." });
      router.refresh();
      setTimeout(() => window.location.reload(), 300);
    } else {
      setFeedback({ type: "error", message: res.message || "Gagal mencatat pengeluaran." });
      setFormLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Hapus catatan pengeluaran ini?")) return;
    const res = await deleteExpenseAction(id);
    if (res.success) {
      router.refresh();
      setTimeout(() => window.location.reload(), 300);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#384551] dark:text-[#dbdcff]">
            Rekap Kas &amp; Laporan Finansial
          </h1>
          <p className="text-sm text-[#8592a3] dark:text-[#a0abb8]">
            Laporan omset kasir, pendapatan servis, pembukuan kas kecil (*petty cash*), dan estimasi margin bersih.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Expense Modal */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5 font-semibold bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
                  <Plus className="size-4" /> Catat Pengeluaran Kas
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base text-[#384551] dark:text-[#dbdcff]">
                  <ArrowDownRight className="size-5 text-[#ff3e1d]" />
                  Catat Pengeluaran Operasional (Petty Cash)
                </DialogTitle>
                <DialogDescription className="text-xs text-[#8592a3] dark:text-[#a0abb8]">
                  Pencatatan kas keluar untuk keperluan operasional harian workshop.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleExpenseSubmit} className="space-y-3 py-2 text-xs">
                <div>
                  <label className="font-medium text-[#566a7f] dark:text-[#c4c5e0] block mb-1">
                    Kategori Pengeluaran *
                  </label>
                  <Select
                    value={expenseForm.category}
                    onValueChange={(val) => {
                      if (val) setExpenseForm({ ...expenseForm, category: val });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kategori..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-[#566a7f] dark:text-[#c4c5e0] block mb-1">
                    Keterangan Pengeluaran *
                  </label>
                  <Input
                    required
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="Contoh: Beli timah solder & alkohol 96%, listrik bulanan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-medium text-[#566a7f] dark:text-[#c4c5e0] block mb-1">
                      Nominal Pengeluaran (Rp) *
                    </label>
                    <Input
                      type="number"
                      min="100"
                      step="1000"
                      required
                      value={expenseForm.amount || ""}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-[#566a7f] dark:text-[#c4c5e0] block mb-1">
                      Tanggal *
                    </label>
                    <Input
                      type="date"
                      required
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter showCloseButton>
                  <Button type="submit" disabled={formLoading} className="bg-[#002D62] hover:bg-[#001F44] text-white">
                    {formLoading ? "Menyimpan..." : "Simpan Pengeluaran"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-[#E6F6F4] border-[#00A896]/30 text-[#00A896] dark:bg-[#00A896]/20"
              : "bg-[#ffe5e0] border-[#ff3e1d]/30 text-[#ff3e1d] dark:bg-[#ff3e1d]/20"
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

      {/* Main KPI Cards Grid (Sneat Signature Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SneatStatCard
          title="Total Penjualan POS"
          value={formatCurrency(summary.totalPosSales)}
          subtitle={`Laba kotor: ${formatCurrency(summary.posGrossProfit)}`}
          icon={Receipt}
          color="primary"
        />
        <SneatStatCard
          title="Total Pendapatan Servis"
          value={formatCurrency(summary.totalServiceRevenue)}
          subtitle={`Jasa teknisi: ${formatCurrency(summary.totalServiceLabor)}`}
          icon={Wrench}
          color="info"
        />
        <SneatStatCard
          title="Piutang Servis Aktif"
          value={formatCurrency(summary.unpaidServiceBalances)}
          subtitle="Unit belum lunas / diambil"
          icon={AlertCircle}
          color="warning"
        />
        <SneatStatCard
          title="Kas Keluar Operasional"
          value={formatCurrency(summary.totalExpenses)}
          subtitle="Biaya petty cash workshop"
          icon={ArrowDownRight}
          color="danger"
        />
      </div>

      {/* Featured Net Margin Card (Sneat Elevated Card) */}
      <div className="rounded-xl bg-white dark:bg-[#2b2c40] p-6 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] border border-[#eceef1] dark:border-[#444564] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-gradient-to-br from-[#002D62]/15 to-[#00A896]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="font-semibold text-xs py-1 px-3">
                <Sparkles className="size-3.5 mr-1 text-[#002D62]" /> Estimasi Margin Bersih (Net Margin)
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#384551] dark:text-[#dbdcff]">
              {formatCurrency(summary.netMargin)}
            </h2>
            <p className="text-xs text-[#8592a3] dark:text-[#a0abb8] max-w-xl leading-relaxed">
              Formula:{" "}
              <span className="font-medium text-[#566a7f] dark:text-[#c4c5e0]">
                (Laba Kotor POS + Total Jasa Servis) − (Komisi Teknisi + Kas Operasional)
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs min-w-[320px] bg-[#f5f5f9] dark:bg-[#232333] p-4 rounded-xl border border-[#eceef1] dark:border-[#444564]">
            <div className="p-3 rounded-lg bg-white dark:bg-[#2b2c40] border border-[#eceef1] dark:border-[#444564] shadow-xs">
              <span className="text-[#8592a3] dark:text-[#a0abb8] block text-[10px] font-semibold uppercase tracking-wider">Laba Kotor POS</span>
              <span className="font-bold text-[#00A896] text-sm">
                + {formatCurrency(summary.posGrossProfit)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-[#2b2c40] border border-[#eceef1] dark:border-[#444564] shadow-xs">
              <span className="text-[#8592a3] dark:text-[#a0abb8] block text-[10px] font-semibold uppercase tracking-wider">Total Jasa Servis</span>
              <span className="font-bold text-[#00A896] text-sm">
                + {formatCurrency(summary.totalServiceLabor)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-[#2b2c40] border border-[#eceef1] dark:border-[#444564] shadow-xs">
              <span className="text-[#8592a3] dark:text-[#a0abb8] block text-[10px] font-semibold uppercase tracking-wider">Komisi Teknisi (~30%)</span>
              <span className="font-bold text-[#ff3e1d] text-sm">
                - {formatCurrency(summary.technicianCommission)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-[#2b2c40] border border-[#eceef1] dark:border-[#444564] shadow-xs">
              <span className="text-[#8592a3] dark:text-[#a0abb8] block text-[10px] font-semibold uppercase tracking-wider">Biaya Operasional</span>
              <span className="font-bold text-[#ff3e1d] text-sm">
                - {formatCurrency(summary.totalExpenses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Ledger Section: Expenses & Recent POS Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Operational Expense Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eceef1] dark:border-[#444564] pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                    <ArrowDownRight className="size-4 text-[#ff3e1d]" /> Buku Kas Pengeluaran Operasional
                  </CardTitle>
                  <CardDescription className="text-xs text-[#8592a3] dark:text-[#a0abb8]">
                    Catatan pengeluaran kas kecil (*petty cash*) workshop.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-semibold text-xs">
                  {expenses.length} Catatan
                </Badge>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8592a3]">
                      Belum ada catatan pengeluaran kas. Klik tombol di atas untuk mencatat.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((exp) => (
                    <TableRow key={exp.id} className="text-xs">
                      <TableCell className="font-medium text-[#566a7f] dark:text-[#dbdcff]">
                        {exp.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#8592a3]">
                        {new Date(exp.date).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#ff3e1d]">
                        {formatCurrency(exp.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-[#ff3e1d] hover:text-[#ff3e1d] hover:bg-[#ffe5e0]"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right Column (5 cols): Recent Invoices */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eceef1] dark:border-[#444564] pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                <Receipt className="size-4 text-[#002D62]" /> Riwayat Transaksi Kasir Terbaru
              </CardTitle>
              <CardDescription className="text-xs text-[#8592a3] dark:text-[#a0abb8]">
                Daftar faktur transaksi POS dan pelunasan servis.
              </CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Faktur</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-xs text-[#8592a3]">
                      Belum ada transaksi POS tercatat.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentInvoices.map((inv) => (
                    <TableRow key={inv.id} className="text-xs">
                      <TableCell>
                        <p className="font-semibold text-[#384551] dark:text-[#dbdcff]">{inv.invoiceNo}</p>
                        <p className="text-[10px] text-[#8592a3]">
                          Kasir: {inv.cashierName} &bull; {new Date(inv.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {inv.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#384551] dark:text-[#dbdcff]">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}

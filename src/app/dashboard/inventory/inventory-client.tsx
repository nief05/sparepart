"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  restockSparepartAction,
  createSparepartAction,
  type CreateSparepartInput,
} from "@/app/actions/inventory";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
} from "lucide-react";

export type SparepartItem = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStockAlert: number;
  updatedAt: Date | string;
};

export function InventoryClient({
  initialSpareparts,
}: {
  initialSpareparts: SparepartItem[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [onlyLowStock, setOnlyLowStock] = React.useState(false);

  // Restock modal state
  const [restockDialogOpen, setRestockDialogOpen] = React.useState(false);
  const [selectedPart, setSelectedPart] = React.useState<SparepartItem | null>(null);
  const [restockQty, setRestockQty] = React.useState<number>(5);
  const [newBuyPrice, setNewBuyPrice] = React.useState<number>(0);
  const [restockLoading, setRestockLoading] = React.useState(false);

  // New sparepart modal state
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [newPartForm, setNewPartForm] = React.useState<CreateSparepartInput>({
    sku: "",
    name: "",
    brand: "",
    buyPrice: 0,
    sellPrice: 0,
    stock: 10,
    minStockAlert: 3,
  });
  const [createLoading, setCreateLoading] = React.useState(false);

  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const lowStockCount = initialSpareparts.filter(
    (p) => p.stock <= p.minStockAlert
  ).length;

  const filteredParts = React.useMemo(() => {
    return initialSpareparts.filter((p) => {
      if (onlyLowStock && p.stock > p.minStockAlert) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [initialSpareparts, onlyLowStock, searchQuery]);


  const openRestockModal = (part: SparepartItem) => {
    setSelectedPart(part);
    setRestockQty(5);
    setNewBuyPrice(part.buyPrice);
    setRestockDialogOpen(true);
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || restockQty < 1) return;

    setRestockLoading(true);
    setFeedback(null);

    const res = await restockSparepartAction(
      selectedPart.id,
      Number(restockQty),
      Number(newBuyPrice)
    );

    if (res.success) {
      setRestockDialogOpen(false);
      setFeedback({
        type: "success",
        message: `Berhasil menambah stok "${selectedPart.name}" sebanyak +${restockQty} unit.`,
      });
      router.refresh();
      setTimeout(() => window.location.reload(), 300);
    } else {
      setFeedback({ type: "error", message: res.message || "Gagal merestok suku cadang." });
      setRestockLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setFeedback(null);

    const res = await createSparepartAction({
      ...newPartForm,
      buyPrice: Number(newPartForm.buyPrice),
      sellPrice: Number(newPartForm.sellPrice),
      stock: Number(newPartForm.stock),
      minStockAlert: Number(newPartForm.minStockAlert),
    });

    if (res.success) {
      setCreateDialogOpen(false);
      setFeedback({
        type: "success",
        message: `Suku cadang "${newPartForm.name}" (${newPartForm.sku}) berhasil didaftarkan.`,
      });
      setNewPartForm({
        sku: "",
        name: "",
        brand: "",
        buyPrice: 0,
        sellPrice: 0,
        stock: 10,
        minStockAlert: 3,
      });
      router.refresh();
      setTimeout(() => window.location.reload(), 300);
    } else {
      setFeedback({ type: "error", message: res.message || "Gagal menambahkan suku cadang." });
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventaris Suku Cadang &amp; Stok</h1>
          <p className="text-sm text-muted-foreground">
            Katalog suku cadang, kontrol batas stok minimum, dan penerimaan pasokan restok.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Part Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5 font-semibold">
                  <Plus className="size-4" /> Tambah Sparepart Baru
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="size-5 text-primary" />
                  Tambah Suku Cadang Baru
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Daftarkan sparepart baru ke katalog inventaris Beres.in.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateSubmit} className="space-y-3 py-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-medium text-muted-foreground block mb-1">Kode SKU *</label>
                    <Input
                      required
                      value={newPartForm.sku}
                      onChange={(e) => setNewPartForm({ ...newPartForm, sku: e.target.value })}
                      placeholder="Contoh: LCD-IP14-OLED"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground block mb-1">Brand Kompatibilitas *</label>
                    <Input
                      required
                      value={newPartForm.brand}
                      onChange={(e) => setNewPartForm({ ...newPartForm, brand: e.target.value })}
                      placeholder="Apple OEM, Samsung Orig"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-muted-foreground block mb-1">Nama Suku Cadang *</label>
                  <Input
                    required
                    value={newPartForm.name}
                    onChange={(e) => setNewPartForm({ ...newPartForm, name: e.target.value })}
                    placeholder="Contoh: LCD Screen OLED iPhone 14"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-medium text-muted-foreground block mb-1">Harga Beli / HPP (Rp) *</label>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      value={newPartForm.buyPrice || ""}
                      onChange={(e) => setNewPartForm({ ...newPartForm, buyPrice: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground block mb-1">Harga Jual Konsumen (Rp) *</label>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      value={newPartForm.sellPrice || ""}
                      onChange={(e) => setNewPartForm({ ...newPartForm, sellPrice: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-medium text-muted-foreground block mb-1">Stok Awal (Unit) *</label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={newPartForm.stock}
                      onChange={(e) => setNewPartForm({ ...newPartForm, stock: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground block mb-1">Limit Peringatan Menipis *</label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={newPartForm.minStockAlert}
                      onChange={(e) => setNewPartForm({ ...newPartForm, minStockAlert: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <DialogFooter showCloseButton>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? "Menyimpan..." : "Simpan Suku Cadang"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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

      {/* Stats Cards (Sneat Signature Stat Cards) */}
      <div className="grid sm:grid-cols-3 gap-5">
        <SneatStatCard
          title="Total SKU Terdaftar"
          value={`${initialSpareparts.length} SKU`}
          subtitle="Katalog aktif di workshop"
          icon={Layers}
          color="primary"
        />
        <SneatStatCard
          title="Peringatan Stok Menipis"
          value={`${lowStockCount} Item`}
          subtitle="Mencapai / di bawah limit batas"
          icon={AlertTriangle}
          color="warning"
        />
        <SneatStatCard
          title="Total Unit Fisik"
          value={`${initialSpareparts.reduce((acc, p) => acc + p.stock, 0)} Unit`}
          subtitle="Unit tersedia di gudang/rak"
          icon={Package}
          color="success"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#2b2c40] p-3 rounded-xl border border-[#eceef1] dark:border-[#444564] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#a1acb8]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SKU, nama sparepart, atau brand..."
            className="pl-9 h-9 text-xs border-[#d9dee3]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={onlyLowStock ? "default" : "outline"}
            size="xs"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`gap-1.5 text-xs h-9 ${
              onlyLowStock
                ? "bg-[#ffab00] hover:bg-[#e69a00] text-white shadow-[0_2px_4px_0_rgba(255,171,0,0.4)]"
                : "border-[#d9dee3] text-[#566a7f] hover:bg-[#f5f5f9]"
            }`}
          >
            <AlertTriangle className="size-3.5 text-[#ffab00]" />
            <span>Hanya Stok Menipis ({lowStockCount})</span>
          </Button>
        </div>
      </div>

      {/* Spareparts Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nama Sparepart</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="text-right">Harga Beli (HPP)</TableHead>
              <TableHead className="text-right">Harga Jual</TableHead>
              <TableHead className="text-center">Stok Fisik</TableHead>
              <TableHead>Status Stok</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-[#8592a3] text-xs">
                  Tidak ada suku cadang yang cocok dengan filter pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filteredParts.map((p) => {
                const isOutOfStock = p.stock === 0;
                const isLowStock = p.stock <= p.minStockAlert;

                return (
                  <TableRow
                    key={p.id}
                    className={isLowStock ? "bg-[#fff2d6]/30 dark:bg-[#ffab00]/10" : ""}
                  >
                    <TableCell className="font-semibold text-xs text-[#384551] dark:text-[#dbdcff]">
                      {p.sku}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#566a7f] dark:text-[#dbdcff]">{p.name}</TableCell>
                    <TableCell className="text-xs text-[#8592a3]">{p.brand}</TableCell>
                    <TableCell className="text-right text-xs text-[#8592a3]">
                      {formatCurrency(p.buyPrice)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-[#384551] dark:text-[#dbdcff]">
                      {formatCurrency(p.sellPrice)}
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs text-[#566a7f]">
                      {p.stock}
                    </TableCell>
                    <TableCell>
                      {isOutOfStock ? (
                        <Badge variant="danger" className="text-[11px] gap-1">
                          <AlertCircle className="size-3" /> Habis (0)
                        </Badge>
                      ) : isLowStock ? (
                        <Badge variant="warning" className="text-[11px] gap-1">
                          <AlertTriangle className="size-3" /> Menipis ({p.stock}/{p.minStockAlert})
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[11px] gap-1">
                          <CheckCircle2 className="size-3" /> Tersedia ({p.stock})
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => openRestockModal(p)}
                        className="gap-1 text-xs text-[#002D62] border-[#E6EDF6] hover:bg-[#E6EDF6]"
                      >
                        <RefreshCw className="size-3 text-[#002D62]" /> Restok
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="size-5 text-primary" />
              Restok Suku Cadang
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tambahkan stok masuk dari supplier untuk{" "}
              <span className="font-semibold text-foreground">{selectedPart?.name}</span> (
              <span className="font-mono">{selectedPart?.sku}</span>).
            </DialogDescription>
          </DialogHeader>

          {selectedPart && (
            <form onSubmit={handleRestockSubmit} className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stok Saat Ini:</span>
                  <span className="font-bold font-mono text-sm">{selectedPart.stock} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Limit Peringatan:</span>
                  <span className="font-mono">{selectedPart.minStockAlert} unit</span>
                </div>
              </div>

              <div>
                <label className="font-medium text-muted-foreground block mb-1">
                  Jumlah Stok Masuk (Unit) *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="font-medium text-muted-foreground block mb-1">
                  Harga Beli / HPP Baru (Rp)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={newBuyPrice || ""}
                  onChange={(e) => setNewBuyPrice(Number(e.target.value))}
                  placeholder={String(selectedPart.buyPrice)}
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Kosongkan jika harga beli supplier tidak berubah.
                </span>
              </div>

              <div className="border-t pt-2 flex justify-between font-bold text-sm text-foreground">
                <span>Stok Setelah Restok:</span>
                <span className="font-mono text-primary text-base">
                  {selectedPart.stock + restockQty} unit
                </span>
              </div>

              <DialogFooter showCloseButton>
                <Button type="submit" disabled={restockLoading}>
                  {restockLoading ? "Menyimpan..." : "Konfirmasi Stok Masuk"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

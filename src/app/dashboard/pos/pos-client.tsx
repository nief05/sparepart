"use client";

import * as React from "react";
import {
  processPosCheckoutAction,
  type ReceiptData,
} from "@/app/actions/pos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  ShoppingCart,
  Trash2,
  Printer,
  Wrench,
  Smartphone,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Package,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react";

export type PosSparepart = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  sellPrice: number;
  stock: number;
};

export type ReadyTicket = {
  id: string;
  ticketNo: string;
  deviceBrand: string;
  deviceModel: string;
  totalCost: number;
  downPayment: number;
  remainingBalance: number;
  customer: {
    name: string;
    phone: string;
  };
};

export type PosCashier = {
  id: string;
  name: string;
  email: string;
};

type CartItem = {
  sparepart: PosSparepart;
  quantity: number;
};

export function PosClient({
  spareparts,
  readyTickets,
  cashiers,
}: {
  spareparts: PosSparepart[];
  readyTickets: ReadyTicket[];
  cashiers: PosCashier[];
}) {
  const [activeTab, setActiveTab] = React.useState<"catalog" | "tickets">("catalog");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Cart state
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [selectedTicket, setSelectedTicket] = React.useState<ReadyTicket | null>(null);

  // Payment state
  const [cashierId, setCashierId] = React.useState<string>(cashiers[0]?.id || "");
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "TRANSFER" | "QRIS">("CASH");
  const [cashTendered, setCashTendered] = React.useState<number>(0);
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);

  // Receipt modal state
  const [receiptModalOpen, setReceiptModalOpen] = React.useState(false);
  const [receiptData, setReceiptData] = React.useState<ReceiptData | null>(null);


  // Calculations
  const sparepartsSubtotal = cart.reduce(
    (sum, item) => sum + item.sparepart.sellPrice * item.quantity,
    0
  );
  const ticketSubtotal = selectedTicket ? selectedTicket.remainingBalance : 0;
  const grandTotal = sparepartsSubtotal + ticketSubtotal;
  const changeAmount = paymentMethod === "CASH" ? Math.max(0, cashTendered - grandTotal) : 0;

  // Filter Catalog
  const filteredParts = React.useMemo(() => {
    return spareparts.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    });
  }, [spareparts, searchQuery]);

  // Cart operations
  const addToCart = (part: PosSparepart) => {
    setCheckoutError(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.sparepart.id === part.id);
      if (existing) {
        if (existing.quantity >= part.stock) {
          setCheckoutError(`Stok "${part.name}" tidak mencukupi (tersisa ${part.stock} unit).`);
          return prev;
        }
        return prev.map((i) =>
          i.sparepart.id === part.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      if (part.stock < 1) {
        setCheckoutError(`Stok "${part.name}" habis.`);
        return prev;
      }
      return [...prev, { sparepart: part, quantity: 1 }];
    });
  };

  const updateQuantity = (partId: string, delta: number) => {
    setCheckoutError(null);
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.sparepart.id === partId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.sparepart.stock) {
              setCheckoutError(`Maksimal stok untuk "${item.sparepart.name}" adalah ${item.sparepart.stock} unit.`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (partId: string) => {
    setCart((prev) => prev.filter((i) => i.sparepart.id !== partId));
  };

  const handleSelectTicket = (ticket: ReadyTicket) => {
    setSelectedTicket((prev) => (prev?.id === ticket.id ? null : ticket));
  };

  const handleCheckout = async () => {
    if (cart.length === 0 && !selectedTicket) {
      setCheckoutError("Keranjang masih kosong.");
      return;
    }

    if (paymentMethod === "CASH" && cashTendered < grandTotal) {
      setCheckoutError("Nominal uang tunai yang diterima kurang dari total tagihan.");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    const res = await processPosCheckoutAction({
      cashierId,
      paymentMethod,
      items: cart.map((i) => ({
        sparepartId: i.sparepart.id,
        quantity: i.quantity,
      })),
      repairTicketId: selectedTicket?.id,
      amountPaid: paymentMethod === "CASH" ? Number(cashTendered) : grandTotal,
    });

    if (res.success && res.receipt) {
      setReceiptData(res.receipt);
      setReceiptModalOpen(true);
      // Reset cart
      setCart([]);
      setSelectedTicket(null);
      setCashTendered(0);
    } else {
      setCheckoutError(res.message || "Gagal memproses transaksi kasir.");
    }

    setCheckoutLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#384551] dark:text-[#dbdcff]">
            Kasir &amp; Point of Sale (POS)
          </h1>
          <p className="text-sm text-[#8592a3] dark:text-[#a0abb8]">
            Penjualan langsung suku cadang &amp; pelunasan unit servis berstatus Siap Ambil.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-white dark:bg-[#2b2c40] p-1.5 px-3 rounded-xl border border-[#eceef1] dark:border-[#444564] shadow-xs">
            <span className="text-[#8592a3] dark:text-[#a0abb8] font-medium">Petugas Kasir:</span>
            <Select
              value={cashierId}
              onValueChange={(val) => {
                if (val) setCashierId(val);
              }}
            >
              <SelectTrigger className="w-44 h-8 text-xs border-[#d9dee3]">
                <SelectValue placeholder="Pilih kasir" />
              </SelectTrigger>
              <SelectContent>
                {cashiers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {checkoutError && (
        <div className="p-3.5 rounded-xl bg-[#ffe5e0] border border-[#ff3e1d]/30 text-[#ff3e1d] dark:bg-[#ff3e1d]/20 flex items-center gap-2 text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      {/* Main POS Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (7 cols): Catalog & Ready Servis */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2 bg-[#ebeef0] dark:bg-[#232333] p-1 rounded-xl">
              <Button
                variant={activeTab === "catalog" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("catalog")}
                className={`gap-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "catalog"
                    ? "bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                    : "text-[#566a7f] hover:bg-white/60"
                }`}
              >
                <Package className="size-3.5" /> Suku Cadang ({spareparts.length})
              </Button>
              <Button
                variant={activeTab === "tickets" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("tickets")}
                className={`gap-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "tickets"
                    ? "bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                    : "text-[#566a7f] hover:bg-white/60"
                }`}
              >
                <Wrench className="size-3.5" /> Servis Siap Ambil ({readyTickets.length})
              </Button>
            </div>
          </div>

          {/* Tab 1: Spareparts Catalog */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#a1acb8]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari SKU atau nama komponen..."
                  className="pl-9 h-9 text-xs border-[#d9dee3] bg-white dark:bg-[#2b2c40] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredParts.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-xs text-[#8592a3]">
                    Tidak ada suku cadang ditemukan.
                  </div>
                ) : (
                  filteredParts.map((part) => {
                    const isOutOfStock = part.stock <= 0;
                    return (
                      <button
                        key={part.id}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addToCart(part)}
                        className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between h-34 ${
                          isOutOfStock
                            ? "opacity-50 cursor-not-allowed bg-white dark:bg-[#2b2c40] border-[#eceef1]"
                            : "bg-white dark:bg-[#2b2c40] border-[#eceef1] dark:border-[#444564] hover:border-[#002D62] hover:shadow-[0_2px_8px_0_rgba(105,108,255,0.2)] hover:translate-y-[-2px] cursor-pointer shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-semibold text-[10px] text-[#8592a3] truncate">
                              {part.sku}
                            </span>
                            {isOutOfStock ? (
                              <Badge variant="danger" className="text-[9px] px-1.5 py-0">
                                Habis
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                Stok: {part.stock}
                              </Badge>
                            )}
                          </div>
                          <p className="font-semibold text-xs leading-snug line-clamp-2 text-[#384551] dark:text-[#dbdcff]">
                            {part.name}
                          </p>
                          <p className="text-[10px] text-[#8592a3]">{part.brand}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#eceef1] dark:border-[#444564] mt-2">
                          <span className="font-bold text-xs text-[#002D62]">
                            {formatCurrency(part.sellPrice)}
                          </span>
                          <span className="size-6 rounded-lg bg-[#E6EDF6] text-[#002D62] flex items-center justify-center transition-transform group-hover:scale-110">
                            <Plus className="size-3.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Ready Repair Tickets for Final Settlement */}
          {activeTab === "tickets" && (
            <div className="space-y-3">
              <p className="text-xs text-[#8592a3]">
                Pilih tiket servis untuk menagih sisa pembayaran unit yang sudah selesai dikerjakan teknisi.
              </p>

              {readyTickets.length === 0 ? (
                <div className="p-8 text-center border border-[#eceef1] dark:border-[#444564] rounded-xl bg-white dark:bg-[#2b2c40] text-xs text-[#8592a3] shadow-xs">
                  Saat ini tidak ada unit berstatus &quot;READY&quot; yang menunggu pengambilan.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {readyTickets.map((t) => {
                    const isSelected = selectedTicket?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#E6EDF6]/40 border-[#002D62] shadow-[0_2px_8px_0_rgba(105,108,255,0.2)]"
                            : "bg-white dark:bg-[#2b2c40] border-[#eceef1] dark:border-[#444564] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] hover:border-[#002D62]/60"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#384551] dark:text-[#dbdcff]">{t.ticketNo}</span>
                            <Badge variant="success" className="text-[10px]">Siap Ambil</Badge>
                          </div>
                          <p className="text-xs font-semibold flex items-center gap-1.5 text-[#566a7f] dark:text-[#c4c5e0]">
                            <Smartphone className="size-3.5 text-[#002D62]" /> {t.deviceBrand} {t.deviceModel}
                          </p>
                          <p className="text-[11px] text-[#8592a3]">
                            Pelanggan: <span className="font-medium text-[#566a7f] dark:text-[#dbdcff]">{t.customer.name}</span> ({t.customer.phone})
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#eceef1] dark:border-[#444564] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[#8592a3] block">Sisa Pelunasan:</span>
                            <span className="font-bold text-sm text-[#00A896]">
                              {formatCurrency(t.remainingBalance)}
                            </span>
                          </div>

                          <Button
                            size="xs"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => handleSelectTicket(t)}
                            className={isSelected ? "bg-[#002D62] text-white" : "text-[#002D62] border-[#E6EDF6] hover:bg-[#E6EDF6]"}
                          >
                            {isSelected ? "Terpilih ✓" : "Muat ke Kasir"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side (5 cols): Active Cart & Checkout */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="pb-3 border-b border-[#eceef1] dark:border-[#444564]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
                  <ShoppingCart className="size-4 text-[#002D62]" /> Ringkasan Keranjang Kasir
                </CardTitle>
                <Badge variant="outline" className="text-xs font-semibold">
                  {cart.length + (selectedTicket ? 1 : 0)} Item
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Selected Repair Ticket Settlement Row (if any) */}
              {selectedTicket && (
                <div className="p-3.5 rounded-xl border bg-[#E6F6F4] border-[#00A896]/30 text-xs flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#00A896] block">
                      Pelunasan Servis
                    </span>
                    <p className="font-bold text-xs text-[#384551]">{selectedTicket.ticketNo}</p>
                    <p className="text-[11px] text-[#8592a3]">
                      {selectedTicket.deviceBrand} {selectedTicket.deviceModel} ({selectedTicket.customer.name})
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-bold text-sm text-[#00A896]">
                      {formatCurrency(selectedTicket.remainingBalance)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setSelectedTicket(null)}
                      title="Batalkan pelunasan tiket ini"
                      className="text-[#ff3e1d] hover:bg-[#ffe5e0]"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cart.length === 0 && !selectedTicket ? (
                  <div className="text-center py-8 text-xs text-[#8592a3]">
                    Keranjang kosong. Pilih suku cadang atau tiket servis di panel kiri.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.sparepart.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-[#eceef1] dark:border-[#444564] bg-[#f5f5f9]/50 dark:bg-[#232333]/50 text-xs"
                    >
                      <div className="max-w-[150px]">
                        <p className="font-semibold truncate text-[#384551] dark:text-[#dbdcff]">{item.sparepart.name}</p>
                        <p className="text-[10px] text-[#8592a3]">
                          {formatCurrency(item.sparepart.sellPrice)}
                        </p>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.sparepart.id, -1)}
                          className="border-[#d9dee3] size-6"
                        >
                          <Minus className="size-2.5" />
                        </Button>
                        <span className="font-bold w-5 text-center text-xs text-[#384551] dark:text-[#dbdcff]">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.sparepart.id, 1)}
                          className="border-[#d9dee3] size-6"
                        >
                          <Plus className="size-2.5" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#384551] dark:text-[#dbdcff]">
                          {formatCurrency(item.sparepart.sellPrice * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeFromCart(item.sparepart.id)}
                          className="text-[#ff3e1d] hover:bg-[#ffe5e0] size-6"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Methods */}
              <div className="border-t border-[#eceef1] dark:border-[#444564] pt-3 space-y-3 text-xs">
                <div>
                  <label className="font-medium text-[#566a7f] dark:text-[#c4c5e0] block mb-1">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={paymentMethod === "CASH" ? "default" : "outline"}
                      size="xs"
                      onClick={() => setPaymentMethod("CASH")}
                      className={`gap-1 h-8 text-xs font-semibold rounded-lg ${
                        paymentMethod === "CASH"
                          ? "bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                          : "border-[#d9dee3] text-[#566a7f] hover:bg-[#f5f5f9]"
                      }`}
                    >
                      <Banknote className="size-3.5" /> Tunai
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "TRANSFER" ? "default" : "outline"}
                      size="xs"
                      onClick={() => setPaymentMethod("TRANSFER")}
                      className={`gap-1 h-8 text-xs font-semibold rounded-lg ${
                        paymentMethod === "TRANSFER"
                          ? "bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                          : "border-[#d9dee3] text-[#566a7f] hover:bg-[#f5f5f9]"
                      }`}
                    >
                      <CreditCard className="size-3.5" /> Transfer
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "QRIS" ? "default" : "outline"}
                      size="xs"
                      onClick={() => setPaymentMethod("QRIS")}
                      className={`gap-1 h-8 text-xs font-semibold rounded-lg ${
                        paymentMethod === "QRIS"
                          ? "bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                          : "border-[#d9dee3] text-[#566a7f] hover:bg-[#f5f5f9]"
                      }`}
                    >
                      <QrCode className="size-3.5" /> QRIS
                    </Button>
                  </div>
                </div>

                {/* Cash Tendered Input (Only if CASH) */}
                {paymentMethod === "CASH" && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#f5f5f9] dark:bg-[#232333] border border-[#eceef1] dark:border-[#444564]">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-[11px] text-[#566a7f] dark:text-[#c4c5e0]">
                        Uang Tunai Diterima (Rp)
                      </label>
                      <button
                        type="button"
                        onClick={() => setCashTendered(grandTotal)}
                        className="text-[10px] text-[#002D62] font-semibold hover:underline"
                      >
                        Uang Pas
                      </button>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="5000"
                      value={cashTendered || ""}
                      onChange={(e) => setCashTendered(Number(e.target.value))}
                      placeholder="0"
                      className="h-8 font-semibold text-sm border-[#d9dee3] bg-white dark:bg-[#2b2c40]"
                    />
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-[#8592a3]">Kembalian:</span>
                      <span className="font-bold text-[#00A896] text-sm">
                        {formatCurrency(changeAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Totals Breakdown */}
                <div className="border-t border-[#eceef1] dark:border-[#444564] pt-2 space-y-1">
                  {sparepartsSubtotal > 0 && (
                    <div className="flex justify-between text-[#8592a3]">
                      <span>Suku Cadang:</span>
                      <span>{formatCurrency(sparepartsSubtotal)}</span>
                    </div>
                  )}
                  {ticketSubtotal > 0 && (
                    <div className="flex justify-between text-[#8592a3]">
                      <span>Pelunasan Servis:</span>
                      <span>{formatCurrency(ticketSubtotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-base border-t border-[#eceef1] dark:border-[#444564] pt-2 text-[#384551] dark:text-[#dbdcff]">
                    <span>Total Tagihan:</span>
                    <span className="text-[#002D62] text-lg">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || grandTotal === 0}
                  className="w-full h-11 text-sm font-bold gap-2 bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                >
                  <Printer className="size-4" />
                  {checkoutLoading ? "Memproses Transaksi..." : "Bayar & Cetak Struk"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printable Thermal Receipt Dialog (58mm / 80mm) */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="size-5" /> Pembayaran Berhasil!
            </DialogTitle>
          </DialogHeader>

          {receiptData && (
            <div className="p-4 bg-white text-black font-mono text-xs rounded border border-zinc-200 print:border-none print:p-0 print:m-0 w-full max-w-[80mm] mx-auto">
              {/* Store Header */}
              <div className="text-center border-b border-dashed border-zinc-400 pb-2 mb-2">
                <h3 className="font-black text-sm uppercase">Beres.in Service &amp; Sparepart</h3>
                <p className="text-[10px] text-zinc-600">Workshop &amp; Suku Cadang Gadget</p>
                <p className="text-[9px] text-zinc-500">Jl. Sudirman No. 45, Jakarta Pusat</p>
                <p className="text-[9px] text-zinc-500">WA: 0812-3456-7890</p>
              </div>

              {/* Transaction Metadata */}
              <div className="text-[10px] border-b border-dashed border-zinc-400 pb-2 mb-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>No. Faktur:</span>
                  <span className="font-bold">{receiptData.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{new Date(receiptData.date).toLocaleDateString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{receiptData.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span>{receiptData.paymentMethod}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border-b border-dashed border-zinc-400 pb-2 mb-2 space-y-1.5 text-[10px]">
                {receiptData.items.map((it, idx) => (
                  <div key={idx}>
                    <p className="font-bold">{it.name}</p>
                    <div className="flex justify-between text-zinc-600">
                      <span>{it.quantity} x {formatCurrency(it.unitPrice)}</span>
                      <span className="font-bold text-black">{formatCurrency(it.subtotal)}</span>
                    </div>
                  </div>
                ))}

                {/* Repair Settlement in Receipt */}
                {receiptData.repairSettlement && (
                  <div className="pt-1 border-t border-zinc-200">
                    <p className="font-bold">[SERVIS] {receiptData.repairSettlement.ticketNo}</p>
                    <p className="text-[9px] text-zinc-600">{receiptData.repairSettlement.device}</p>
                    <p className="text-[9px] text-zinc-600">Klien: {receiptData.repairSettlement.customerName}</p>
                    <div className="flex justify-between font-bold text-black pt-0.5">
                      <span>Pelunasan:</span>
                      <span>{formatCurrency(receiptData.repairSettlement.balancePaid)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Totals */}
              <div className="text-[10px] space-y-1 border-b border-dashed border-zinc-400 pb-2 mb-2">
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(receiptData.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Diterima:</span>
                  <span>{formatCurrency(receiptData.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Kembalian:</span>
                  <span>{formatCurrency(receiptData.change)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[9px] text-zinc-500 pt-1 space-y-0.5">
                <p>Terima kasih atas kepercayaan Anda.</p>
                <p>Barang yang sudah dibeli tidak dapat ditukar.</p>
                <p>Garansi servis berlaku sesuai ketentuan nota.</p>
              </div>
            </div>
          )}

          <DialogFooter className="print:hidden flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReceiptModalOpen(false);
                setReceiptData(null);
              }}
            >
              Transaksi Baru
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 font-bold"
            >
              <Printer className="size-4" /> Cetak Struk Thermal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

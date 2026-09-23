"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createRepairTicketAction } from "@/app/actions/repairs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Smartphone,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Phone,
  ShieldAlert,
} from "lucide-react";

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  address: string | null;
}

interface TechnicianOption {
  id: string;
  name: string;
  email: string;
}

const COMMON_ISSUES = [
  "Layar Retak / Pecah",
  "Touchscreen Tidak Responsif",
  "Baterai Kembung / Cepat Habis",
  "Mati Total (No Power)",
  "Tidak Bisa Dicas / Port Longgar",
  "Kamera Buram / Getar",
  "Speaker / Mic Mati",
  "Terkena Air (Water Damage)",
  "Bootloop / Stuck Logo",
  "Tombol Fisik Rusak",
];

export function IntakeForm({
  customers,
  technicians,
  previewTicketNo,
}: {
  customers: CustomerOption[];
  technicians: TechnicianOption[];
  previewTicketNo: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Customer state
  const [customerMode, setCustomerMode] = React.useState<"new" | "existing">("new");
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>("");
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");

  // Device state
  const [deviceBrand, setDeviceBrand] = React.useState("Apple");
  const [deviceModel, setDeviceModel] = React.useState("");
  const [imeiSn, setImeiSn] = React.useState("");
  const [passcode, setPasscode] = React.useState("");

  // Complaint & Checklist
  const [selectedIssues, setSelectedIssues] = React.useState<string[]>([]);
  const [customComplaint, setCustomComplaint] = React.useState("");

  // Costs
  const [estCost, setEstCost] = React.useState<number>(0);
  const [downPayment, setDownPayment] = React.useState<number>(0);
  const [technicianId, setTechnicianId] = React.useState<string>(
    technicians[0]?.id || ""
  );

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Merge issues checklist + custom description
    const fullComplaintParts: string[] = [];
    if (selectedIssues.length > 0) {
      fullComplaintParts.push(`Keluhan checklist: ${selectedIssues.join(", ")}`);
    }
    if (customComplaint.trim()) {
      fullComplaintParts.push(`Catatan tambahan: ${customComplaint.trim()}`);
    }

    const complaint = fullComplaintParts.join(". ") || "Pemeriksaan unit servis berkala.";

    const res = await createRepairTicketAction({
      customerId: customerMode === "existing" ? selectedCustomerId : undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || undefined,
      deviceBrand: deviceBrand.trim(),
      deviceModel: deviceModel.trim(),
      imeiSn: imeiSn.trim() || undefined,
      passcode: passcode.trim() || undefined,
      complaint,
      estCost: Number(estCost) || 0,
      downPayment: Number(downPayment) || 0,
      technicianId: technicianId || undefined,
    });

    if (res.success && res.ticketId) {
      router.push(`/dashboard/repairs/${res.ticketId}`);
    } else {
      setErrorMsg(res.message || "Gagal menyimpan tiket perbaikan.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#384551] dark:text-[#dbdcff]">Formulir Intake Servis Baru</h1>
          <p className="text-sm text-[#8592a3] dark:text-[#a0abb8]">
            Registrasi perangkat pelanggan, keluhan kerusakan, dan pencetakan tanda terima.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#8592a3] font-semibold uppercase tracking-wider mb-1">Preview No. Tiket</p>
          <Badge variant="primary" className="text-sm px-3.5 py-1 font-bold shadow-xs">
            {previewTicketNo}
          </Badge>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#ffe5e0] border border-[#ff3e1d]/30 text-[#ff3e1d] dark:bg-[#ff3e1d]/20 flex items-center gap-2 text-sm">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Customer Section */}
      <Card>
        <CardHeader className="pb-3 border-b border-[#eceef1] dark:border-[#444564]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
              <User className="size-4 text-[#002D62]" /> 1. Informasi Pelanggan
            </CardTitle>
            <div className="flex items-center gap-1.5 bg-[#ebeef0] dark:bg-[#232333] p-1 rounded-xl">
              <Button
                type="button"
                variant={customerMode === "new" ? "default" : "ghost"}
                size="xs"
                onClick={() => setCustomerMode("new")}
                className={`font-semibold rounded-lg ${
                  customerMode === "new"
                    ? "bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                    : "text-[#566a7f] hover:bg-white/60"
                }`}
              >
                Pelanggan Baru
              </Button>
              <Button
                type="button"
                variant={customerMode === "existing" ? "default" : "ghost"}
                size="xs"
                onClick={() => setCustomerMode("existing")}
                className={`font-semibold rounded-lg ${
                  customerMode === "existing"
                    ? "bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                    : "text-[#566a7f] hover:bg-white/60"
                }`}
              >
                Pilih Tersimpan
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs text-[#8592a3]">
            Nomor kontak WhatsApp akan digunakan pelanggan untuk cek status online.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {customerMode === "existing" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Pilih Data Pelanggan Terdaftar
              </label>
              <Select
                value={selectedCustomerId}
                onValueChange={(val) => {
                  if (val) handleSelectCustomer(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih nama pelanggan..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Nama Lengkap Pelanggan *
              </label>
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Nomor WhatsApp / HP *
              </label>
              <Input
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Alamat Lengkap (Opsional)
            </label>
            <Input
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Contoh: Jl. Sudirman No. 45, Jakarta"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Device Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="size-4 text-primary" /> 2. Identitas Perangkat
          </CardTitle>
          <CardDescription className="text-xs">
            Spesifikasi unit dan data pengaman untuk proses pengetesan teknisi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Brand Perangkat *
              </label>
              <Select
                value={deviceBrand}
                onValueChange={(val) => {
                  if (val) setDeviceBrand(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apple">Apple (iPhone / iPad)</SelectItem>
                  <SelectItem value="Samsung">Samsung</SelectItem>
                  <SelectItem value="Xiaomi">Xiaomi / Redmi / POCO</SelectItem>
                  <SelectItem value="Oppo">Oppo</SelectItem>
                  <SelectItem value="Vivo">Vivo</SelectItem>
                  <SelectItem value="Realme">Realme</SelectItem>
                  <SelectItem value="Infinix">Infinix / Tecno</SelectItem>
                  <SelectItem value="Google">Google Pixel</SelectItem>
                  <SelectItem value="Asus">Asus ROG / Zenfone</SelectItem>
                  <SelectItem value="Other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Tipe / Model Lengkap *
              </label>
              <Input
                required
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="Contoh: iPhone 13 Pro Max 256GB"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Nomor IMEI / Serial Number (Opsional)
              </label>
              <Input
                value={imeiSn}
                onChange={(e) => setImeiSn(e.target.value)}
                placeholder="Contoh: 356789012345678"
                className="font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Passcode / Pola Kunci Layar
              </label>
              <Input
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="PIN atau sebutkan pola (untuk QC teknisi)"
                className="font-mono text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Problem Checklist & Complaint */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="size-4 text-primary" /> 3. Checklist Gejala &amp; Keluhan Kerusakan
          </CardTitle>
          <CardDescription className="text-xs">
            Pilih gejala kerusakan fisik dan fungsional yang ditemukan saat penerimaan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMMON_ISSUES.map((issue) => {
              const isSelected = selectedIssues.includes(issue);
              return (
                <button
                  type="button"
                  key={issue}
                  onClick={() => toggleIssue(issue)}
                  className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[#E6EDF6] text-[#002D62] border-[#002D62] shadow-xs"
                      : "bg-white dark:bg-[#2b2c40] border-[#eceef1] dark:border-[#444564] text-[#566a7f] hover:border-[#002D62]/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`size-2 rounded-full ${isSelected ? "bg-[#002D62]" : "bg-[#d9dee3]"}`} />
                    <span className="truncate">{issue}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-xs font-medium text-[#566a7f] dark:text-[#c4c5e0] block mb-1">
              Catatan Kerusakan / Kronologi Tambahan
            </label>
            <Input
              value={customComplaint}
              onChange={(e) => setCustomComplaint(e.target.value)}
              placeholder="Contoh: Terjatuh dari motor, layar kedap-kedip, kamera belakang getar..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Pricing, DP & Technician Assignment */}
      <Card>
        <CardHeader className="pb-3 border-b border-[#eceef1] dark:border-[#444564]">
          <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
            <DollarSign className="size-4 text-[#002D62]" /> 4. Estimasi Biaya &amp; Teknisi
          </CardTitle>
          <CardDescription className="text-xs text-[#8592a3]">
            Tentukan estimasi awal dan penerimaan uang muka (DP).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[#566a7f] dark:text-[#c4c5e0] block mb-1">
                Estimasi Biaya (Rp)
              </label>
              <Input
                type="number"
                min="0"
                step="10000"
                value={estCost || ""}
                onChange={(e) => setEstCost(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#566a7f] dark:text-[#c4c5e0] block mb-1">
                Uang Muka / DP (Rp)
              </label>
              <Input
                type="number"
                min="0"
                step="10000"
                value={downPayment || ""}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#566a7f] dark:text-[#c4c5e0] block mb-1">
                Teknisi Penanggung Jawab
              </label>
              <Select
                value={technicianId}
                onValueChange={(val) => {
                  if (val) setTechnicianId(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih teknisi..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Submission Controls */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/repairs")}
          className="border-[#d9dee3] text-[#566a7f]"
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="px-8 font-semibold bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
          {loading ? "Menyimpan Tiket..." : "Simpan & Proses Tiket"}
        </Button>
      </div>
    </form>
  );
}

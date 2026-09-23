import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BeresLogo } from "@/components/beres-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuickTrackingWidget } from "@/components/quick-tracking-widget";
import {
  Wrench,
  Smartphone,
  BatteryCharging,
  Cpu,
  ShieldCheck,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  Headphones,
  FileCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

const SERVICES = [
  {
    icon: Smartphone,
    title: "Ganti Layar LCD & OLED",
    description: "Perbaikan kaca retak, touchscreen tidak responsif, atau green screen bergaris dengan suku cadang original bersertifikat.",
    turnaround: "45 Menit",
    warranty: "Garansi 90 Hari",
  },
  {
    icon: BatteryCharging,
    title: "Penggantian Baterai Health 100%",
    description: "Atasi baterai boros, kembung, restart sendiri, atau mati mendadak dengan sel baterai berstandar OEM & kalibrasi sistem.",
    turnaround: "30 Menit",
    warranty: "Garansi 6 Bulan",
  },
  {
    icon: Cpu,
    title: "Perbaikan Mesin & Motherboard",
    description: "Diagnosa short circuit, ic power, ic audio, konslet karena air (water damage), dan servis mikrosolder level chip presisi.",
    turnaround: "1-3 Hari",
    warranty: "Garansi 30 Hari",
  },
  {
    icon: Wrench,
    title: "Port Pengisian Daya & Fleksibel",
    description: "Solusi perangkat tidak bisa dicas, port longgar, mikrofon tidak berfungsi, atau tombol power & volume rusak.",
    turnaround: "40 Menit",
    warranty: "Garansi 30 Hari",
  },
  {
    icon: Headphones,
    title: "Kamera & Modul Sensor",
    description: "Perbaikan kamera blur, bergetar, Face ID dinonaktifkan, atau penggantian kaca lensa pelindung kamera yang retak.",
    turnaround: "60 Menit",
    warranty: "Garansi 30 Hari",
  },
  {
    icon: FileCheck,
    title: "Software & Pemulihan Sistem",
    description: "Penanganan bootloop, stuck logo Apple/Android, update sistem operasi gagal, bypass akun, dan backup data penting.",
    turnaround: "1-2 Jam",
    warranty: "Garansi Garansi",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Registrasi & Intake Unit",
    desc: "Unit didaftarkan ke sistem Beres.in dengan pencatatan keluhan, IMEI, dan fisik awal secara transparan.",
  },
  {
    step: "02",
    title: "Diagnosis & Estimasi",
    desc: "Teknisi melakukan pengetesan mendalam dan memberikan rincian estimasi biaya serta suku cadang.",
  },
  {
    step: "03",
    title: "Pengerjaan Presisi",
    desc: "Perbaikan dilakukan menggunakan peralatan profesional, sparepart original, dan ESD safety.",
  },
  {
    step: "04",
    title: "Quality Control (QC)",
    desc: "Pengujian menyeluruh meliputi layar, baterai, kamera, jaringan, audio, dan sensor perangkat.",
  },
  {
    step: "05",
    title: "Penyerahan & Bergaransi",
    desc: "Pelanggan mengambil unit, melunasi pembayaran, dan menerima kartu garansi digital resmi.",
  },
];

export default async function LandingPage() {
  const spareparts = await prisma.sparepart.findMany({
    take: 6,
    orderBy: { stock: "desc" },
  });


  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-primary/20">
      {/* Navigation Header */}
      <header className="border-b bg-white/90 dark:bg-[#0B192C]/90 backdrop-blur-md sticky top-0 z-40 border-[#E2E8F0] dark:border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <BeresLogo markSize={34} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#5B6B79] dark:text-[#94A3B8]">
            <a href="#layanan" className="hover:text-[#002D62] dark:hover:text-[#00A896] transition-colors">
              Layanan
            </a>
            <a href="#katalog" className="hover:text-[#002D62] dark:hover:text-[#00A896] transition-colors">
              Katalog Sparepart
            </a>
            <a href="#alur" className="hover:text-[#002D62] dark:hover:text-[#00A896] transition-colors">
              Alur Servis
            </a>
            <Link href="/tracking" className="hover:text-[#002D62] dark:hover:text-[#00A896] transition-colors">
              Lacak Servis
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold text-[#002D62] dark:text-[#00A896] hover:bg-[#E6EDF6] dark:hover:bg-[#1E3A5F] px-2.5 sm:px-3">
                <ShieldCheck className="size-3.5 text-[#00A896]" />
                <span className="hidden sm:inline">Portal Admin</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            </Link>
            <Link href="/tracking" className="hidden sm:inline-block">
              <Button variant="outline" size="sm" className="gap-2 font-medium border-[#CBD5E1] dark:border-[#1E3A5F]">
                <Search className="size-3.5 text-[#00A896]" /> Lacak Servis
              </Button>
            </Link>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Beres.in%20saya%20ingin%20konsultasi%20servis"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="font-bold bg-[#00A896] hover:bg-[#008F80] text-white shadow-[0_2px_8px_0_rgba(0,168,150,0.3)] text-xs sm:text-sm px-3 sm:px-4">
                <span className="hidden sm:inline">Konsultasi WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b dark:border-[#1E3A5F]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_50%_0%,rgba(0,168,150,0.12),transparent)]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs font-semibold bg-[#E6EDF6] dark:bg-[#1E3A5F] text-[#002D62] dark:text-[#00A896] border border-[#002D62]/15">
            <Sparkles className="size-3.5 text-[#00A896]" />
            <span>Urusan Sparepart &amp; Nota Servis, Sekali Klik Beres.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-[#002D62] dark:text-white">
            Solusi Servis Gadget{" "}
            <span className="text-[#00A896]">
              Cepat, Presisi &amp; Transparan.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#5B6B79] dark:text-[#94A3B8] max-w-2xl mx-auto font-medium">
            Platform Manajemen Servis, Inventaris Sparepart, dan Kasir POS Terintegrasi untuk Teknisi Indonesia.
          </p>

          {/* Quick Tracking Widget CTA */}
          <div className="flex justify-center pt-2">
            <QuickTrackingWidget />
          </div>

          {/* Trust points */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" /> Garansi Suku Cadang Hingga 90 Hari
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" /> Teknisi Spesialis Bersertifikat
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" /> Tracking Progres Real-Time
            </span>
          </div>
        </div>
      </section>

      {/* Services List Section */}
      <section id="layanan" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <Badge variant="secondary" className="text-xs">Layanan Profesional</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Kategori Perbaikan yang Kami Tangani
          </h2>
          <p className="text-sm text-muted-foreground">
            Dikerjakan dengan perkakas standar industri mikroelektronika dan suku cadang teruji.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <Card key={idx} className="hover:border-primary/50 transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="outline" className="text-[11px] font-medium">
                      <Clock className="size-3 mr-1" /> {srv.turnaround}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{srv.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {srv.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between border-t pt-3 text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {srv.warranty}
                    </span>
                    <Link href="/tracking" className="text-primary hover:underline flex items-center gap-1">
                      Konsultasi <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Spareparts Catalog Preview Section */}
      <section id="katalog" className="py-16 bg-zinc-100/60 dark:bg-zinc-900/40 border-y dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <Badge variant="secondary" className="text-xs mb-2">Stok &amp; Komponen</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Katalog Suku Cadang Original &amp; OEM
              </h2>
              <p className="text-sm text-muted-foreground">
                Harga transparan tanpa biaya tersembunyi. Tersedia ready-stock di workshop kami.
              </p>
            </div>
            <Link href="/tracking">
              <Button variant="outline" size="sm" className="gap-2">
                <Package className="size-4" /> Butuh Sparepart Khusus?
              </Button>
            </Link>
          </div>

          <Card className="overflow-hidden border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Kode SKU</TableHead>
                  <TableHead>Deskripsi Sparepart</TableHead>
                  <TableHead>Brand Kompatibilitas</TableHead>
                  <TableHead className="text-right">Harga Komponen</TableHead>
                  <TableHead className="text-center">Ketersediaan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spareparts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {p.sku}
                    </TableCell>
                    <TableCell className="font-semibold">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {p.brand}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {formatCurrency(p.sellPrice)}
                    </TableCell>
                    <TableCell className="text-center">
                      {p.stock > 0 ? (
                        <Badge className="bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/15 border-emerald-200 dark:text-emerald-400">
                          Ready ({p.stock} unit)
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Pre-Order</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* 5-Step Repair Workflow */}
      <section id="alur" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <Badge variant="secondary" className="text-xs">Transparan &amp; Terstruktur</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Bagaimana Alur Servis Bekerja?
          </h2>
          <p className="text-sm text-muted-foreground">
            Semua tahapan tercatat otomatis ke dalam sistem Beres.in untuk kenyamanan Anda.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {WORKFLOW_STEPS.map((wf, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border bg-card text-card-foreground space-y-3 relative hover:border-primary/40 transition-colors"
            >
              <span className="text-2xl font-black font-mono text-primary/40">
                {wf.step}
              </span>
              <h3 className="font-bold text-base leading-snug">{wf.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {wf.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-[#002D62] text-white dark:bg-[#081628] border-t border-[#1E3A5F]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Sudah Memiliki Tiket Servis dari Petugas?
          </h2>
          <p className="text-[#CBD5E1] text-sm sm:text-base max-w-xl mx-auto font-medium">
            Cek progres terkini atau cetak ulang lembar Tanda Terima (SPK) servis Anda kapan saja melalui portal online.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/tracking">
              <Button size="lg" className="bg-[#00A896] hover:bg-[#008F80] text-white font-bold px-8 gap-2 shadow-[0_4px_16px_0_rgba(0,168,150,0.35)] transition-all">
                <span>Buka Portal Tracking</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-[#0E1F36] border-[#E2E8F0] dark:border-[#1E3A5F] py-8 text-xs text-[#5B6B79] dark:text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center">
              <BeresLogo markSize={26} />
            </Link>
            <span className="text-[#CBD5E1]">&bull;</span>
            <span>Urusan Sparepart &amp; Nota Servis, Sekali Klik Beres.</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Beres.in. Hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}

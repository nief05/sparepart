import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { generateQrDataUrl } from "@/lib/qrcode";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { PrintButton } from "./print-button";
import { BeresLogo } from "@/components/beres-logo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ ticketNo: string }>;
}

export default async function PrintTicketPage({ params }: PageProps) {
  const { ticketNo } = await params;

  const ticket = await prisma.repairTicket.findUnique({
    where: { ticketNo },
    include: {
      customer: true,
      technician: true,
      partsUsed: {
        include: {
          sparepart: true,
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const trackingUrl = `/tracking?ticket=${encodeURIComponent(ticket.ticketNo)}`;
  const qrCodeDataUrl = await generateQrDataUrl(
    `https://beres.in/tracking?ticket=${encodeURIComponent(ticket.ticketNo)}`
  );


  const remaining = Math.max(0, ticket.totalCost - ticket.downPayment);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-8 flex flex-col items-center print:bg-white print:p-0">
      {/* Print Controls (Hidden on print) */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 print:hidden">
        <Link href={`/tracking?ticket=${ticket.ticketNo}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="size-4" /> Kembali ke Tracking
          </Button>
        </Link>
        <PrintButton />
      </div>

      {/* Printable Receipt Sheet (A5 / 80mm Compatible) */}
      <div className="w-full max-w-2xl bg-white text-black p-6 sm:p-8 rounded-lg shadow-sm border border-zinc-200 print:border-0 print:shadow-none print:p-2 print:max-w-full">
        {/* Workshop Header */}
        <div className="text-center border-b pb-4 mb-4 border-zinc-300">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BeresLogo markSize={32} />
          </div>
          <p className="text-xs text-zinc-600 font-sans">
            Spesialis Servis Smartphone, Laptop &amp; Sparepart Original
          </p>
          <p className="text-xs text-zinc-600 font-sans">
            Jl. Sudirman No. 45, Jakarta Pusat &bull; WhatsApp: 0812-3456-7890
          </p>
        </div>

        {/* Title & Ticket Header */}
        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded mb-4 print:bg-transparent print:border-black">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-bold text-zinc-500">
                Surat Perintah Kerja (SPK)
              </p>
              <h2 className="text-xl font-mono font-black text-black">
                {ticket.ticketNo}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Tanggal Masuk</p>
              <p className="text-xs font-semibold">
                {new Date(ticket.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Device Information */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-4 border-b border-zinc-200 pb-4">
          <div className="space-y-1">
            <p className="font-bold text-zinc-500 uppercase">Data Pelanggan:</p>
            <p className="font-semibold text-sm">{ticket.customer.name}</p>
            <p className="font-mono">{ticket.customer.phone}</p>
            {ticket.customer.address && (
              <p className="text-zinc-600">{ticket.customer.address}</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="font-bold text-zinc-500 uppercase">Data Perangkat:</p>
            <p className="font-semibold text-sm">
              {ticket.deviceBrand} {ticket.deviceModel}
            </p>
            <p className="font-mono text-zinc-700">
              IMEI/SN: {ticket.imeiSn || "-"}
            </p>
            <p className="font-mono text-zinc-700">
              Passcode/Pola: {ticket.passcode || "(Tidak ada)"}
            </p>
          </div>
        </div>

        {/* Complaint & Diagnosis */}
        <div className="mb-4 text-xs border-b border-zinc-200 pb-4">
          <p className="font-bold text-zinc-500 uppercase mb-1">
            Keluhan / Gejala Kerusakan:
          </p>
          <div className="bg-zinc-50 p-2.5 rounded font-sans text-zinc-800 border border-zinc-100 print:border-none print:p-0">
            {ticket.complaint}
          </div>
        </div>

        {/* Replaced Parts (if any) */}
        {ticket.partsUsed.length > 0 && (
          <div className="mb-4 text-xs border-b border-zinc-200 pb-4">
            <p className="font-bold text-zinc-500 uppercase mb-2">
              Suku Cadang / Tindakan:
            </p>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-600">
                  <th className="py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Harga</th>
                </tr>
              </thead>
              <tbody>
                {ticket.partsUsed.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100">
                    <td className="py-1 font-medium">{p.sparepart.name}</td>
                    <td className="text-center py-1">{p.quantity}</td>
                    <td className="text-right py-1 font-mono">
                      {formatCurrency(p.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cost Summary & QR Code */}
        <div className="flex items-center justify-between border-b border-zinc-300 pb-4 mb-4">
          <div className="flex items-center gap-3">
            {qrCodeDataUrl ? (
              <Image
                src={qrCodeDataUrl}
                alt="QR Code Tracking"
                width={84}
                height={84}
                className="border border-zinc-300 p-0.5"
              />
            ) : null}
            <div className="text-[11px] text-zinc-600 max-w-[170px] leading-tight">
              <p className="font-bold text-black">Scan untuk Pantau Servis</p>
              <p>Cek progres reparasi &amp; status QC secara online setiap saat.</p>
            </div>
          </div>

          <div className="w-56 text-xs space-y-1">
            <div className="flex justify-between text-zinc-600">
              <span>Estimasi Biaya:</span>
              <span className="font-mono">{formatCurrency(ticket.estCost)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Uang Muka (DP):</span>
              <span className="font-mono">{formatCurrency(ticket.downPayment)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-300 pt-1 font-bold text-sm">
              <span>Sisa Pembayaran:</span>
              <span className="font-mono text-black">{formatCurrency(remaining)}</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="text-[10px] text-zinc-600 leading-normal mb-6">
          <p className="font-bold text-zinc-800 uppercase mb-0.5">
            Syarat &amp; Ketentuan Pengambilan Unit:
          </p>
          <ol className="list-decimal pl-3 space-y-0.5">
            <li>Pengambilan unit wajib menunjukkan tanda terima ini / konfirmasi WhatsApp resmi.</li>
            <li>Garansi suku cadang berlaku 30 hari sejak unit diambil (segel tidak sobek/rusak).</li>
            <li>Unit yang tidak diambil dalam 30 hari sejak status siap diambil bukan tanggung jawab workshop.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs pt-2">
          <div>
            <p className="text-zinc-600 mb-12">Pelanggan,</p>
            <p className="font-semibold underline uppercase">
              {ticket.customer.name}
            </p>
          </div>
          <div>
            <p className="text-zinc-600 mb-12">Customer Service / Teknisi,</p>
            <p className="font-semibold underline uppercase">
              {ticket.technician?.name || "Petugas Workshop"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

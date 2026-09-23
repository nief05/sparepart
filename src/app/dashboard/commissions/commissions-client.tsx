"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { SneatStatCard } from "@/components/sneat-stat-card";
import { SneatStatusBadge } from "@/components/sneat-status-badge";
import {
  Percent,
  Users,
  Wrench,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

export type TechnicianJob = {
  id: string;
  ticketNo: string;
  deviceBrand: string;
  deviceModel: string;
  customerName: string;
  status: string;
  laborCost: number;
  totalCost: number;
  updatedAt: Date | string;
};

export type TechnicianData = {
  id: string;
  name: string;
  email: string;
  completedJobs: TechnicianJob[];
};

export function CommissionsClient({
  technicians,
}: {
  technicians: TechnicianData[];
}) {
  const [commissionRate, setCommissionRate] = React.useState<number>(30);
  const [expandedTechId, setExpandedTechId] = React.useState<string | null>(null);


  // Totals
  const totalJobsCount = technicians.reduce(
    (sum, t) => sum + t.completedJobs.length,
    0
  );

  const totalLaborGenerated = technicians.reduce(
    (sum, t) =>
      sum + t.completedJobs.reduce((jSum, j) => jSum + j.laborCost, 0),
    0
  );

  const totalCommissionPayout = totalLaborGenerated * (commissionRate / 100);
  const workshopNetLaborShare = totalLaborGenerated - totalCommissionPayout;

  const toggleExpand = (techId: string) => {
    setExpandedTechId((prev) => (prev === techId ? null : techId));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#384551] dark:text-[#dbdcff]">
            Bagi Hasil &amp; Komisi Teknisi
          </h1>
          <p className="text-sm text-[#8592a3] dark:text-[#a0abb8]">
            Perhitungan insentif komisi dari ongkos jasa perbaikan (*service labor fee*) unit yang telah selesai.
          </p>
        </div>

        {/* Commission Rate Configurator */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#2b2c40] p-2 rounded-xl border border-[#eceef1] dark:border-[#444564] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
          <span className="text-xs font-semibold text-[#8592a3] dark:text-[#a0abb8] pl-1">
            Persentase Komisi:
          </span>
          <div className="flex items-center gap-1">
            {[20, 30, 40, 50].map((rate) => (
              <Button
                key={rate}
                variant={commissionRate === rate ? "default" : "outline"}
                size="xs"
                onClick={() => setCommissionRate(rate)}
                className={`h-7 px-2.5 text-xs font-semibold ${
                  commissionRate === rate
                    ? "bg-[#002D62] hover:bg-[#001F44] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                    : "border-[#d9dee3] text-[#566a7f] hover:bg-[#f5f5f9]"
                }`}
              >
                {rate}%
              </Button>
            ))}
          </div>
          <div className="w-16">
            <Input
              type="number"
              min="0"
              max="100"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="h-7 text-xs font-bold text-center p-1 border-[#d9dee3]"
            />
          </div>
        </div>
      </div>

      {/* KPI Metric Cards (Sneat Signature Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <SneatStatCard
          title="Unit Selesai"
          value={`${totalJobsCount} Unit`}
          subtitle="Status READY / DELIVERED"
          icon={CheckCircle2}
          color="success"
        />
        <SneatStatCard
          title="Total Biaya Jasa"
          value={formatCurrency(totalLaborGenerated)}
          subtitle="Akumulasi ongkos jasa teknisi"
          icon={Wrench}
          color="info"
        />
        <SneatStatCard
          title="Total Komisi Teknisi"
          value={formatCurrency(totalCommissionPayout)}
          subtitle={`Hak bagi hasil (${commissionRate}%)`}
          icon={Percent}
          color="primary"
        />
        <SneatStatCard
          title="Net Share Workshop"
          value={formatCurrency(workshopNetLaborShare)}
          subtitle="Margin workshop setelah komisi"
          icon={DollarSign}
          color="secondary"
        />
      </div>

      {/* Summary Table per Technician */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-[#eceef1] dark:border-[#444564] pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#384551] dark:text-[#dbdcff]">
            <Users className="size-4 text-[#002D62]" /> Rekapitulasi Komisi per Teknisi
          </CardTitle>
          <CardDescription className="text-xs text-[#8592a3] dark:text-[#a0abb8]">
            Klik pada teknisi untuk melihat daftar rincian unit servis yang dikerjakan.
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Teknisi</TableHead>
              <TableHead className="text-center">Unit Dikerjakan</TableHead>
              <TableHead className="text-right">Total Ongkos Jasa</TableHead>
              <TableHead className="text-center">Bagi Hasil</TableHead>
              <TableHead className="text-right">Komisi Siap Cair</TableHead>
              <TableHead className="text-center">Rincian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-[#8592a3]">
                  Belum ada data teknisi terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              technicians.map((tech) => {
                const techLaborTotal = tech.completedJobs.reduce(
                  (sum, j) => sum + j.laborCost,
                  0
                );
                const techCommission = techLaborTotal * (commissionRate / 100);
                const isExpanded = expandedTechId === tech.id;

                return (
                  <React.Fragment key={tech.id}>
                    <TableRow className="hover:bg-[#f5f5f9]/60 dark:hover:bg-[#232333]/60">
                      <TableCell>
                        <p className="font-semibold text-xs text-[#384551] dark:text-[#dbdcff]">{tech.name}</p>
                        <p className="text-[11px] text-[#8592a3]">{tech.email}</p>
                      </TableCell>
                      <TableCell className="text-center font-bold text-xs text-[#566a7f]">
                        {tech.completedJobs.length} unit
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs text-[#566a7f]">
                        {formatCurrency(techLaborTotal)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[11px]">
                          {commissionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-[#002D62]">
                        {formatCurrency(techCommission)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => toggleExpand(tech.id)}
                          className="gap-1 text-xs text-[#002D62] hover:bg-[#E6EDF6]"
                        >
                          {isExpanded ? (
                            <>Tutup <ChevronUp className="size-3" /></>
                          ) : (
                            <>Lihat ({tech.completedJobs.length}) <ChevronDown className="size-3" /></>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expandable Drill-Down Row */}
                    {isExpanded && (
                      <TableRow className="bg-[#f5f5f9]/30 dark:bg-[#232333]/30 border-b border-[#eceef1]">
                        <TableCell colSpan={6} className="p-4">
                          <div className="bg-white dark:bg-[#2b2c40] border border-[#eceef1] dark:border-[#444564] rounded-xl p-4 space-y-3 shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#8592a3] flex items-center gap-1.5">
                              <Wrench className="size-3.5 text-[#002D62]" /> Riwayat Unit Selesai: {tech.name}
                            </p>

                            {tech.completedJobs.length === 0 ? (
                              <p className="text-xs text-[#8592a3] py-2">
                                Belum ada unit servis berstatus READY atau DELIVERED untuk teknisi ini.
                              </p>
                            ) : (
                              <div className="border border-[#eceef1] dark:border-[#444564] rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>No. Tiket</TableHead>
                                      <TableHead>Perangkat</TableHead>
                                      <TableHead>Pelanggan</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Biaya Jasa</TableHead>
                                      <TableHead className="text-right">Komisi ({commissionRate}%)</TableHead>
                                      <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {tech.completedJobs.map((job) => {
                                      const jobCommission = job.laborCost * (commissionRate / 100);
                                      return (
                                        <TableRow key={job.id} className="text-xs">
                                          <TableCell className="font-semibold text-[#384551] dark:text-[#dbdcff]">
                                            {job.ticketNo}
                                          </TableCell>
                                          <TableCell>
                                            <span className="font-semibold">{job.deviceBrand}</span> {job.deviceModel}
                                          </TableCell>
                                          <TableCell className="text-[#8592a3]">
                                            {job.customerName}
                                          </TableCell>
                                          <TableCell>
                                            <SneatStatusBadge status={job.status} />
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {formatCurrency(job.laborCost)}
                                          </TableCell>
                                          <TableCell className="text-right font-bold text-[#002D62]">
                                            {formatCurrency(jobCommission)}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <Link href={`/dashboard/repairs/${job.id}`}>
                                              <Button size="icon-xs" variant="ghost" title="Buka Detail" className="text-[#002D62] hover:bg-[#E6EDF6]">
                                                <ExternalLink className="size-3" />
                                              </Button>
                                            </Link>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

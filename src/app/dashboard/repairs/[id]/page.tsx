import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WorkshopClient, type TicketDetail, type AvailableSparepart } from "./workshop-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RepairDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [ticket, availableParts] = await Promise.all([
    prisma.repairTicket.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: true,
        partsUsed: {
          include: {
            sparepart: true,
          },
        },
      },
    }),
    prisma.sparepart.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        brand: true,
        sellPrice: true,
        stock: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!ticket) {
    notFound();
  }

  const formattedTicket: TicketDetail = {
    id: ticket.id,
    ticketNo: ticket.ticketNo,
    deviceBrand: ticket.deviceBrand,
    deviceModel: ticket.deviceModel,
    imeiSn: ticket.imeiSn,
    passcode: ticket.passcode,
    complaint: ticket.complaint,
    status: ticket.status,
    estCost: ticket.estCost,
    downPayment: ticket.downPayment,
    laborCost: ticket.laborCost,
    totalCost: ticket.totalCost,
    diagnosisNotes: ticket.diagnosisNotes,
    createdAt: ticket.createdAt,
    customer: ticket.customer,
    technician: ticket.technician,
    partsUsed: ticket.partsUsed,
  };

  return (
    <WorkshopClient
      ticket={formattedTicket}
      availableParts={availableParts}
    />
  );
}

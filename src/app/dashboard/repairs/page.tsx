import { prisma } from "@/lib/prisma";
import { RepairsBoard, type BoardTicket } from "./repairs-board";

export const dynamic = "force-dynamic";

export default async function RepairsDashboardPage() {
  const [tickets, technicians] = await Promise.all([
    prisma.repairTicket.findMany({
      include: {
        customer: {
          select: { name: true, phone: true },
        },
        technician: {
          select: { id: true, name: true },
        },
        partsUsed: {
          select: { id: true, quantity: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["TECHNICIAN", "ADMIN"] },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const formattedTickets: BoardTicket[] = tickets.map((t) => ({
    id: t.id,
    ticketNo: t.ticketNo,
    deviceBrand: t.deviceBrand,
    deviceModel: t.deviceModel,
    imeiSn: t.imeiSn,
    complaint: t.complaint,
    status: t.status as BoardTicket["status"],
    estCost: t.estCost,
    downPayment: t.downPayment,
    laborCost: t.laborCost,
    totalCost: t.totalCost,
    createdAt: t.createdAt,
    customer: t.customer,
    technician: t.technician,
    partsUsed: t.partsUsed,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <RepairsBoard
        initialTickets={formattedTickets}
        technicians={technicians}
      />
    </div>
  );
}

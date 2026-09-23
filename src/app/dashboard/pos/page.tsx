import { prisma } from "@/lib/prisma";
import { PosClient, type PosSparepart, type ReadyTicket, type PosCashier } from "./pos-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kasir POS & Pelunasan Servis | Beres.in",
};

export default async function PosPage() {
  const [spareparts, readyTickets, users] = await Promise.all([
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
    prisma.repairTicket.findMany({
      where: {
        status: "READY",
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const formattedTickets: ReadyTicket[] = readyTickets.map((t) => ({
    id: t.id,
    ticketNo: t.ticketNo,
    deviceBrand: t.deviceBrand,
    deviceModel: t.deviceModel,
    totalCost: t.totalCost,
    downPayment: t.downPayment,
    remainingBalance: Math.max(0, t.totalCost - t.downPayment),
    customer: t.customer,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <PosClient
        spareparts={spareparts}
        readyTickets={formattedTickets}
        cashiers={users}
      />
    </div>
  );
}

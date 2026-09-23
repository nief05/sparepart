import { prisma } from "@/lib/prisma";
import { CommissionsClient, type TechnicianData } from "./commissions-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bagi Hasil & Komisi Teknisi | Beres.in",
};

export default async function CommissionsPage() {
  const technicians = await prisma.user.findMany({
    where: {
      role: { in: ["TECHNICIAN", "ADMIN"] },
    },
    include: {
      repairTickets: {
        where: {
          status: { in: ["READY", "DELIVERED"] },
        },
        include: {
          customer: {
            select: { name: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const formattedTechs: TechnicianData[] = technicians.map((tech) => ({
    id: tech.id,
    name: tech.name,
    email: tech.email,
    completedJobs: tech.repairTickets.map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      deviceBrand: t.deviceBrand,
      deviceModel: t.deviceModel,
      customerName: t.customer.name,
      status: t.status,
      laborCost: t.laborCost,
      totalCost: t.totalCost,
      updatedAt: t.updatedAt,
    })),
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <CommissionsClient technicians={formattedTechs} />
    </div>
  );
}

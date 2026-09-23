import { prisma } from "@/lib/prisma";
import { generateTicketNo } from "@/app/actions/repairs";
import { IntakeForm } from "./intake-form";

export const dynamic = "force-dynamic";

export default async function NewRepairPage() {
  const [customers, technicians, previewTicketNo] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, name: true, phone: true, address: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["TECHNICIAN", "ADMIN"] },
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    generateTicketNo(),
  ]);

  return (
    <div className="max-w-5xl mx-auto">
      <IntakeForm
        customers={customers}
        technicians={technicians}
        previewTicketNo={previewTicketNo}
      />
    </div>
  );
}

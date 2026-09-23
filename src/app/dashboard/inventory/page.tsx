import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./inventory-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventaris Sparepart | Beres.in",
};

export default async function InventoryPage() {
  const spareparts = await prisma.sparepart.findMany({
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-7xl mx-auto">
      <InventoryClient initialSpareparts={spareparts} />
    </div>
  );
}

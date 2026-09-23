"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { RepairStatus } from "@prisma/client";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully handle standalone or testing environments
  }
}

// Generate unique ticket number: RBM-YYYYMMDD-XXXX
export async function generateTicketNo(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const prefix = `RBM-${year}${month}${day}-`;

  const latest = await prisma.repairTicket.findFirst({
    where: {
      ticketNo: {
        startsWith: prefix,
      },
    },
    orderBy: {
      ticketNo: "desc",
    },
    select: { ticketNo: true },
  });

  if (!latest) {
    return `${prefix}0001`;
  }

  const parts = latest.ticketNo.split("-");
  const lastSeq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

const CreateTicketSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().trim().min(2, "Nama pelanggan minimal 2 karakter"),
  customerPhone: z.string().trim().min(5, "Nomor HP minimal 5 karakter"),
  customerAddress: z.string().optional(),
  deviceBrand: z.string().trim().min(1, "Brand perangkat wajib diisi"),
  deviceModel: z.string().trim().min(1, "Model perangkat wajib diisi"),
  imeiSn: z.string().optional(),
  passcode: z.string().optional(),
  complaint: z.string().trim().min(3, "Keluhan kerusakan wajib diisi"),
  estCost: z.number().min(0).default(0),
  downPayment: z.number().min(0).default(0),
  technicianId: z.string().optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export async function createRepairTicketAction(input: CreateTicketInput) {
  const validation = CreateTicketSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Data input tidak valid",
    };
  }

  const data = validation.data;

  try {
    let customerId = data.customerId;

    // Find or create customer
    if (!customerId) {
      let existingCustomer = await prisma.customer.findFirst({
        where: { phone: data.customerPhone },
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            name: data.customerName,
            phone: data.customerPhone,
            address: data.customerAddress || null,
          },
        });
        customerId = newCustomer.id;
      }
    }

    const ticketNo = await generateTicketNo();

    const ticket = await prisma.repairTicket.create({
      data: {
        ticketNo,
        customerId,
        deviceBrand: data.deviceBrand,
        deviceModel: data.deviceModel,
        imeiSn: data.imeiSn || null,
        passcode: data.passcode || null,
        complaint: data.complaint,
        status: RepairStatus.RECEIVED,
        estCost: data.estCost,
        downPayment: data.downPayment,
        laborCost: 0,
        totalCost: data.estCost || 0,
        technicianId: data.technicianId || null,
      },
    });

    safeRevalidate("/dashboard/repairs");
    safeRevalidate("/tracking");

    return {
      success: true,
      ticketId: ticket.id,
      ticketNo: ticket.ticketNo,
    };
  } catch (err) {
    console.error("Failed to create repair ticket:", err);
    return {
      success: false,
      message: "Gagal membuat tiket perbaikan.",
    };
  }
}

export async function updateTicketStatusAction(
  ticketId: string,
  newStatus: RepairStatus,
  diagnosisNotes?: string
) {
  try {
    const updated = await prisma.repairTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        ...(diagnosisNotes !== undefined ? { diagnosisNotes } : {}),
      },
    });

    safeRevalidate(`/dashboard/repairs/${ticketId}`);
    safeRevalidate("/dashboard/repairs");
    safeRevalidate("/tracking");

    return { success: true, ticket: updated };
  } catch (err) {
    console.error("Failed to update status:", err);
    return { success: false, message: "Gagal memperbarui status servis." };
  }
}

export async function addPartToTicketAction(
  ticketId: string,
  sparepartId: string,
  quantity: number = 1
) {
  if (quantity < 1) {
    return { success: false, message: "Jumlah suku cadang minimal 1." };
  }

  try {
    // Atomic Prisma transaction for stock deduction & part addition
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check current sparepart stock
      const sparepart = await tx.sparepart.findUnique({
        where: { id: sparepartId },
      });

      if (!sparepart) {
        throw new Error("Sparepart tidak ditemukan.");
      }

      if (sparepart.stock < quantity) {
        throw new Error(
          `Stok tidak mencukupi! Tersisa ${sparepart.stock} unit, diminta ${quantity} unit.`
        );
      }

      // 2. Decrement stock atomically
      await tx.sparepart.update({
        where: { id: sparepartId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      // 3. Add or update RepairPartUsed
      const existingPartUsed = await tx.repairPartUsed.findFirst({
        where: {
          repairTicketId: ticketId,
          sparepartId: sparepartId,
        },
      });

      if (existingPartUsed) {
        await tx.repairPartUsed.update({
          where: { id: existingPartUsed.id },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });
      } else {
        await tx.repairPartUsed.create({
          data: {
            repairTicketId: ticketId,
            sparepartId: sparepartId,
            quantity,
            price: sparepart.sellPrice,
          },
        });
      }

      // 4. Recalculate ticket total cost = sum(all parts) + laborCost
      const allPartsUsed = await tx.repairPartUsed.findMany({
        where: { repairTicketId: ticketId },
      });

      const partsTotal = allPartsUsed.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );

      const ticket = await tx.repairTicket.findUnique({
        where: { id: ticketId },
      });

      const newTotalCost = partsTotal + (ticket?.laborCost || 0);

      await tx.repairTicket.update({
        where: { id: ticketId },
        data: {
          totalCost: newTotalCost,
        },
      });

      return { partsTotal, newTotalCost };
    });

    safeRevalidate(`/dashboard/repairs/${ticketId}`);
    safeRevalidate("/dashboard/repairs");
    safeRevalidate("/tracking");

    return { success: true, ...result };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menambahkan sparepart.";
    console.error("Transaction failed:", errorMsg);
    return { success: false, message: errorMsg };
  }
}

export async function updateLaborFeeAction(ticketId: string, laborCost: number) {
  try {
    const partsUsed = await prisma.repairPartUsed.findMany({
      where: { repairTicketId: ticketId },
    });

    const partsTotal = partsUsed.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );

    const newTotalCost = partsTotal + Math.max(0, laborCost);

    const updated = await prisma.repairTicket.update({
      where: { id: ticketId },
      data: {
        laborCost: Math.max(0, laborCost),
        totalCost: newTotalCost,
      },
    });

    safeRevalidate(`/dashboard/repairs/${ticketId}`);
    safeRevalidate("/dashboard/repairs");
    safeRevalidate("/tracking");

    return { success: true, ticket: updated };
  } catch (err) {
    console.error("Failed to update labor cost:", err);
    return { success: false, message: "Gagal memperbarui biaya jasa." };
  }
}

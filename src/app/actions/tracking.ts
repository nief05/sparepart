"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const TrackingSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, "Nomor tiket atau nomor telepon minimal 3 karakter.")
    .max(50, "Nomor tiket atau nomor telepon terlalu panjang."),
});

export type TrackingResult = {
  id: string;
  ticketNo: string;
  deviceBrand: string;
  deviceModel: string;
  imeiSn: string | null;
  passcode: string | null;
  complaint: string;
  status: "RECEIVED" | "DIAGNOSIS" | "PROGRESS" | "QC" | "READY" | "DELIVERED";
  estCost: number;
  downPayment: number;
  totalCost: number;
  remainingBalance: number;
  createdAt: Date;
  customer: {
    name: string;
    phone: string;
    address: string | null;
  };
  technician: {
    name: string;
  } | null;
  partsUsed: Array<{
    id: string;
    quantity: number;
    price: number;
    sparepart: {
      sku: string;
      name: string;
      brand: string;
    };
  }>;
};

export type TrackingActionResponse = {
  success: boolean;
  message?: string;
  tickets?: TrackingResult[];
};

export async function getRepairTracking(
  rawQuery: string
): Promise<TrackingActionResponse> {
  const parseResult = TrackingSchema.safeParse({ query: rawQuery });

  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.issues[0]?.message || "Input tidak valid.",
    };
  }

  const query = parseResult.data.query;

  try {
    // 1. Search by exact or case-insensitive ticket number
    let tickets = await prisma.repairTicket.findMany({
      where: {
        OR: [
          { ticketNo: { equals: query } },
          { ticketNo: { contains: query } },
        ],
      },
      include: {
        customer: true,
        technician: true,
        partsUsed: {
          include: {
            sparepart: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. If no ticket matches, search by customer phone number
    if (tickets.length === 0) {
      tickets = await prisma.repairTicket.findMany({
        where: {
          customer: {
            phone: {
              contains: query,
            },
          },
        },
        include: {
          customer: true,
          technician: true,
          partsUsed: {
            include: {
              sparepart: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (tickets.length === 0) {
      return {
        success: false,
        message: `Tidak ditemukan data perbaikan untuk "${query}". Pastikan nomor tiket atau nomor WhatsApp sesuai.`,
      };
    }

    const formattedTickets: TrackingResult[] = tickets.map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      deviceBrand: t.deviceBrand,
      deviceModel: t.deviceModel,
      imeiSn: t.imeiSn,
      passcode: t.passcode,
      complaint: t.complaint,
      status: t.status as TrackingResult["status"],
      estCost: t.estCost,
      downPayment: t.downPayment,
      totalCost: t.totalCost,
      remainingBalance: Math.max(0, t.totalCost - t.downPayment),
      createdAt: t.createdAt,
      customer: {
        name: t.customer.name,
        phone: t.customer.phone,
        address: t.customer.address,
      },
      technician: t.technician ? { name: t.technician.name } : null,
      partsUsed: t.partsUsed.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        price: p.price,
        sparepart: {
          sku: p.sparepart.sku,
          name: p.sparepart.name,
          brand: p.sparepart.brand,
        },
      })),
    }));

    return {
      success: true,
      tickets: formattedTickets,
    };
  } catch (error) {
    console.error("Tracking lookup error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan internal saat mencari data perbaikan.",
    };
  }
}

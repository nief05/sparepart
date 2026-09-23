"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { RepairStatus } from "@prisma/client";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Tolerates CLI/testing environments
  }
}

export async function generateInvoiceNo(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const prefix = `INV-${year}${month}${day}-`;

  const latest = await prisma.posTransaction.findFirst({
    where: {
      invoiceNo: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNo: "desc",
    },
    select: { invoiceNo: true },
  });

  if (!latest) {
    return `${prefix}0001`;
  }

  const parts = latest.invoiceNo.split("-");
  const lastSeq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

const CartItemSchema = z.object({
  sparepartId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const CheckoutSchema = z.object({
  cashierId: z.string().min(1, "ID Kasir diperlukan"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "QRIS"]),
  items: z.array(CartItemSchema),
  repairTicketId: z.string().optional(),
  amountPaid: z.number().min(0).default(0),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export type ReceiptLineItem = {
  name: string;
  brand: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type ReceiptData = {
  invoiceNo: string;
  date: Date | string;
  cashierName: string;
  paymentMethod: string;
  items: ReceiptLineItem[];
  repairSettlement?: {
    ticketNo: string;
    device: string;
    customerName: string;
    totalCost: number;
    downPayment: number;
    balancePaid: number;
  };
  totalAmount: number;
  amountPaid: number;
  change: number;
};

export async function processPosCheckoutAction(input: CheckoutInput) {
  const validation = CheckoutSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Data checkout tidak valid",
    };
  }

  const { cashierId, paymentMethod, items, repairTicketId, amountPaid } = validation.data;

  if (items.length === 0 && !repairTicketId) {
    return {
      success: false,
      message: "Keranjang belanja kosong. Pilih item sparepart atau tiket servis.",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify Cashier
      const cashier = await tx.user.findUnique({
        where: { id: cashierId },
        select: { id: true, name: true },
      });
      if (!cashier) {
        throw new Error("Kasir tidak ditemukan.");
      }

      const receiptItems: ReceiptLineItem[] = [];
      let itemsTotal = 0;

      // 2. Validate & Decrement Spareparts Stock
      for (const cartItem of items) {
        const sparepart = await tx.sparepart.findUnique({
          where: { id: cartItem.sparepartId },
        });

        if (!sparepart) {
          throw new Error(`Suku cadang dengan ID ${cartItem.sparepartId} tidak ditemukan.`);
        }

        if (sparepart.stock < cartItem.quantity) {
          throw new Error(
            `Stok "${sparepart.name}" tidak mencukupi! Tersisa ${sparepart.stock} unit, diminta ${cartItem.quantity} unit.`
          );
        }

        // Atomic decrement
        await tx.sparepart.update({
          where: { id: cartItem.sparepartId },
          data: {
            stock: {
              decrement: cartItem.quantity,
            },
          },
        });

        const subtotal = sparepart.sellPrice * cartItem.quantity;
        itemsTotal += subtotal;

        receiptItems.push({
          name: sparepart.name,
          brand: sparepart.brand,
          sku: sparepart.sku,
          quantity: cartItem.quantity,
          unitPrice: sparepart.sellPrice,
          subtotal,
        });
      }

      // 3. Handle Repair Ticket Settlement (if loaded into POS)
      let repairSettlement: ReceiptData["repairSettlement"] = undefined;
      let repairBalanceAmount = 0;

      if (repairTicketId) {
        const ticket = await tx.repairTicket.findUnique({
          where: { id: repairTicketId },
          include: { customer: true },
        });

        if (!ticket) {
          throw new Error("Tiket servis tidak ditemukan.");
        }

        repairBalanceAmount = Math.max(0, ticket.totalCost - ticket.downPayment);

        // Update ticket to DELIVERED
        await tx.repairTicket.update({
          where: { id: repairTicketId },
          data: {
            status: RepairStatus.DELIVERED,
          },
        });

        repairSettlement = {
          ticketNo: ticket.ticketNo,
          device: `${ticket.deviceBrand} ${ticket.deviceModel}`,
          customerName: ticket.customer.name,
          totalCost: ticket.totalCost,
          downPayment: ticket.downPayment,
          balancePaid: repairBalanceAmount,
        };
      }

      const grandTotal = itemsTotal + repairBalanceAmount;

      if (paymentMethod === "CASH" && amountPaid < grandTotal) {
        throw new Error(
          `Uang tunai tidak mencukupi! Tagihan: Rp ${grandTotal.toLocaleString("id-ID")}, Diterima: Rp ${amountPaid.toLocaleString("id-ID")}`
        );
      }

      const change = paymentMethod === "CASH" ? Math.max(0, amountPaid - grandTotal) : 0;
      const invoiceNo = await generateInvoiceNo();

      // 4. Create POS Transaction
      const transaction = await tx.posTransaction.create({
        data: {
          invoiceNo,
          cashierId,
          totalAmount: grandTotal,
          paymentMethod,
          repairTicketId: repairTicketId || null,
          items: {
            create: items.map((it) => {
              const itemInfo = receiptItems.find((r) => r.sku === it.sparepartId || true);
              const price = receiptItems.find((r) => r.name)?.unitPrice || 0;
              return {
                sparepartId: it.sparepartId,
                quantity: it.quantity,
                unitPrice: price,
              };
            }),
          },
        },
      });

      const receiptData: ReceiptData = {
        invoiceNo: transaction.invoiceNo,
        date: transaction.createdAt,
        cashierName: cashier.name,
        paymentMethod,
        items: receiptItems,
        repairSettlement,
        totalAmount: grandTotal,
        amountPaid: paymentMethod === "CASH" ? amountPaid : grandTotal,
        change,
      };

      return receiptData;
    });

    safeRevalidate("/dashboard/pos");
    safeRevalidate("/dashboard/inventory");
    safeRevalidate("/dashboard/repairs");
    safeRevalidate("/tracking");
    safeRevalidate("/");

    return {
      success: true,
      receipt: result,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Transaksi kasir gagal diproses.";
    console.error("POS Checkout error:", errorMsg);
    return {
      success: false,
      message: errorMsg,
    };
  }
}

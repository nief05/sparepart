"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Tolerates CLI/testing environments
  }
}

const RestockSchema = z.object({
  sparepartId: z.string().min(1, "ID Sparepart diperlukan"),
  quantityToAdd: z.number().int().min(1, "Jumlah restok minimal 1 unit"),
  newBuyPrice: z.number().min(0).optional(),
});

export async function restockSparepartAction(
  sparepartId: string,
  quantityToAdd: number,
  newBuyPrice?: number
) {
  const validation = RestockSchema.safeParse({
    sparepartId,
    quantityToAdd,
    newBuyPrice,
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Input restok tidak valid",
    };
  }

  try {
    const updated = await prisma.sparepart.update({
      where: { id: sparepartId },
      data: {
        stock: {
          increment: quantityToAdd,
        },
        ...(newBuyPrice !== undefined && newBuyPrice > 0
          ? { buyPrice: newBuyPrice }
          : {}),
      },
    });

    safeRevalidate("/dashboard/inventory");
    safeRevalidate("/dashboard/pos");
    safeRevalidate("/dashboard/repairs");
    safeRevalidate("/");

    return {
      success: true,
      sparepart: updated,
    };
  } catch (err) {
    console.error("Restock error:", err);
    return {
      success: false,
      message: "Gagal memperbarui stok sparepart.",
    };
  }
}

const CreateSparepartSchema = z.object({
  sku: z.string().trim().min(2, "SKU minimal 2 karakter"),
  name: z.string().trim().min(2, "Nama suku cadang minimal 2 karakter"),
  brand: z.string().trim().min(1, "Brand kompatibilitas diperlukan"),
  buyPrice: z.number().min(0, "Harga beli tidak boleh negatif"),
  sellPrice: z.number().min(0, "Harga jual tidak boleh negatif"),
  stock: z.number().int().min(0, "Stok awal minimal 0"),
  minStockAlert: z.number().int().min(1, "Limit peringatan minimal 1").default(5),
});

export type CreateSparepartInput = z.infer<typeof CreateSparepartSchema>;

export async function createSparepartAction(input: CreateSparepartInput) {
  const validation = CreateSparepartSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Data input tidak valid",
    };
  }

  try {
    const existing = await prisma.sparepart.findUnique({
      where: { sku: validation.data.sku },
    });

    if (existing) {
      return {
        success: false,
        message: `SKU "${validation.data.sku}" sudah terdaftar.`,
      };
    }

    const created = await prisma.sparepart.create({
      data: validation.data,
    });

    safeRevalidate("/dashboard/inventory");
    safeRevalidate("/dashboard/pos");
    safeRevalidate("/");

    return {
      success: true,
      sparepart: created,
    };
  } catch (err) {
    console.error("Create sparepart error:", err);
    return {
      success: false,
      message: "Gagal menambahkan suku cadang baru.",
    };
  }
}

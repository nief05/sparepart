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

const ExpenseSchema = z.object({
  description: z.string().trim().min(2, "Keterangan pengeluaran minimal 2 karakter"),
  amount: z.number().min(100, "Nominal minimal Rp 100"),
  category: z.string().trim().min(1, "Kategori wajib dipilih"),
  date: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof ExpenseSchema>;

export async function recordExpenseAction(input: ExpenseInput) {
  const validation = ExpenseSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Data pengeluaran tidak valid",
    };
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        description: validation.data.description,
        amount: validation.data.amount,
        category: validation.data.category,
        date: validation.data.date ? new Date(validation.data.date) : new Date(),
      },
    });

    safeRevalidate("/dashboard/reports");

    return {
      success: true,
      expense,
    };
  } catch (err) {
    console.error("Record expense error:", err);
    return {
      success: false,
      message: "Gagal mencatat pengeluaran kas.",
    };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });

    safeRevalidate("/dashboard/reports");

    return {
      success: true,
    };
  } catch (err) {
    console.error("Delete expense error:", err);
    return {
      success: false,
      message: "Gagal menghapus catatan pengeluaran.",
    };
  }
}

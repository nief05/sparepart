import { prisma } from "@/lib/prisma";
import {
  ReportsClient,
  type ReportSummary,
  type ExpenseRecord,
  type InvoiceSummary,
} from "./reports-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rekap Kas & Laporan Finansial | Beres.in",
};

export default async function ReportsPage() {
  const [posTransactions, repairTickets, expenses] = await Promise.all([
    prisma.posTransaction.findMany({
      include: {
        cashier: {
          select: { name: true },
        },
        items: {
          include: {
            sparepart: {
              select: { buyPrice: true, sellPrice: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.repairTicket.findMany({
      select: {
        id: true,
        status: true,
        totalCost: true,
        laborCost: true,
        downPayment: true,
      },
    }),
    prisma.expense.findMany({
      orderBy: { date: "desc" },
    }),
  ]);

  // 1. POS Metrics
  const totalPosSales = posTransactions.reduce((acc, t) => acc + t.totalAmount, 0);

  const posGrossProfit = posTransactions.reduce((acc, t) => {
    const itemsProfit = t.items.reduce((iSum, it) => {
      const marginPerUnit = it.unitPrice - it.sparepart.buyPrice;
      return iSum + marginPerUnit * it.quantity;
    }, 0);
    return acc + itemsProfit;
  }, 0);

  // 2. Service Metrics
  const totalServiceRevenue = repairTickets.reduce((acc, t) => acc + t.totalCost, 0);
  const totalServiceLabor = repairTickets.reduce((acc, t) => acc + t.laborCost, 0);

  // Unpaid balances for tickets not yet DELIVERED
  const unpaidServiceBalances = repairTickets
    .filter((t) => t.status !== "DELIVERED")
    .reduce((acc, t) => acc + Math.max(0, t.totalCost - t.downPayment), 0);

  // 3. Expenses
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // 4. Technician Commission (standard 30% of labor)
  const technicianCommission = totalServiceLabor * 0.30;

  // 5. Simple Net Margin: (POS Gross Profit + Service Labor) - (Technician Commission + Expenses)
  const netMargin =
    posGrossProfit + totalServiceLabor - (technicianCommission + totalExpenses);

  const summary: ReportSummary = {
    totalPosSales,
    posGrossProfit,
    totalServiceRevenue,
    totalServiceLabor,
    unpaidServiceBalances,
    totalExpenses,
    technicianCommission,
    netMargin,
  };

  const formattedExpenses: ExpenseRecord[] = expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount,
    category: e.category,
    date: e.date,
  }));

  const formattedInvoices: InvoiceSummary[] = posTransactions.slice(0, 10).map((inv) => ({
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    cashierName: inv.cashier.name,
    totalAmount: inv.totalAmount,
    paymentMethod: inv.paymentMethod,
    createdAt: inv.createdAt,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <ReportsClient
        summary={summary}
        expenses={formattedExpenses}
        recentInvoices={formattedInvoices}
      />
    </div>
  );
}

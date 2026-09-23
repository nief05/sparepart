import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function maskUrl(url: string | undefined): string {
  if (!url) return "NOT_SET";
  try {
    const parsed = new URL(url.replace("prisma+", ""));
    return `${parsed.protocol}//${parsed.username}:****@${parsed.host}${parsed.pathname}`;
  } catch {
    return url.substring(0, 15) + "...";
  }
}

export async function GET() {
  const envInfo = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    maskedDatabaseUrl: maskUrl(process.env.DATABASE_URL),
    hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
    maskedPostgresPrismaUrl: maskUrl(process.env.POSTGRES_PRISMA_URL),
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    // 1. Test raw query
    const dbTime = await prisma.$queryRaw`SELECT NOW() as now`;

    // 2. Test user table count
    let userCount = -1;
    let tablesExist = false;
    try {
      userCount = await prisma.user.count();
      tablesExist = true;
    } catch (tableErr: any) {
      return NextResponse.json({
        status: "DATABASE_CONNECTED_BUT_TABLES_MISSING",
        message: "Database PostgreSQL terhubung, namun tabel belum dibuat.",
        error: tableErr?.message || String(tableErr),
        env: envInfo,
        dbTime,
      });
    }

    return NextResponse.json({
      status: "SUCCESS",
      message: "Database dan tabel siap!",
      tablesExist,
      userCount,
      env: envInfo,
      dbTime,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "CONNECTION_FAILED",
      message: "Gagal terhubung ke database.",
      error: err?.message || String(err),
      env: envInfo,
    }, { status: 500 });
  }
}

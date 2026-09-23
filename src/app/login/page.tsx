import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "./login-form";
import { BeresLogo } from "@/components/beres-logo";

export const metadata = {
  title: "Login Administrator - Beres.in Workshop & POS",
  description: "Masuk ke portal dashboard workshop Beres.in untuk mengelola servis dan kasir.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B192C] flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Decorative ambient background blur using brand colors */}
      <div className="absolute top-[-10%] left-[-5%] w-[320px] sm:w-[450px] h-[320px] sm:h-[450px] bg-[#002D62]/10 dark:bg-[#002D62]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[320px] sm:w-[450px] h-[320px] sm:h-[450px] bg-[#00A896]/10 dark:bg-[#00A896]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] mx-auto relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8 w-full flex flex-col items-center">
          <Link href="/" className="inline-block group mb-3 hover:scale-105 transition-transform">
            <BeresLogo markSize={42} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#002D62] dark:text-white tracking-tight">
            Selamat Datang Kembali! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 px-2">
            Masuk ke panel manajemen workshop &amp; POS dengan presisi
          </p>
        </div>

        {/* Card Form */}
        <div className="w-full bg-white dark:bg-[#112338] rounded-2xl p-5 sm:p-7 shadow-[0_4px_20px_0_rgba(0,45,98,0.08)] border border-[#E2E8F0] dark:border-[#1E3A5F]">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-[#64748B]">Memuat form autentikasi...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Bottom Navigation Links */}
        <div className="w-full mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-[#002D62] dark:hover:text-[#00A896] transition-colors font-medium"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke Beranda
          </Link>

          <Link
            href="/tracking"
            className="hover:text-[#002D62] dark:hover:text-[#00A896] transition-colors font-medium"
          >
            Lacak Servis Pelanggan →
          </Link>
        </div>
      </div>
    </div>
  );
}

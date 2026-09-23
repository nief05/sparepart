"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = rawCallbackUrl ? decodeURIComponent(rawCallbackUrl) : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedDemo, setCopiedDemo] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFillDemo = () => {
    setEmail("admin@rbm.com");
    setPassword("admin123");
    setError(null);
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("callbackUrl", callbackUrl);

    startTransition(async () => {
      const res = await loginAction(null, formData);
      if (res.success) {
        window.location.href = callbackUrl;
      } else {
        setError(res.error || "Gagal masuk. Periksa email dan kata sandi Anda.");
      }
    });
  };

  return (
    <div className="w-full space-y-5">
      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input Group */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#002D62] dark:text-[#CBD5E1]">
            Email Pengguna
          </label>
          <div className="flex items-center rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] bg-[#F8FAFC]/80 dark:bg-[#0E1F36]/80 focus-within:border-[#002D62] dark:focus-within:border-[#00A896] focus-within:ring-2 focus-within:ring-[#002D62]/15 dark:focus-within:ring-[#00A896]/20 transition-all duration-150">
            <div className="pl-3.5 pr-2.5 text-[#64748B] flex items-center justify-center pointer-events-none">
              <Mail className="size-4 text-[#002D62] dark:text-[#00A896]" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rbm.com"
              autoComplete="email"
              className="w-full h-11 bg-transparent pr-3.5 text-sm text-[#002D62] dark:text-white placeholder:text-[#94A3B8] outline-none font-medium"
            />
          </div>
        </div>

        {/* Password Input Group */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#002D62] dark:text-[#CBD5E1]">
              Kata Sandi
            </label>
          </div>
          <div className="flex items-center rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] bg-[#F8FAFC]/80 dark:bg-[#0E1F36]/80 focus-within:border-[#002D62] dark:focus-within:border-[#00A896] focus-within:ring-2 focus-within:ring-[#002D62]/15 dark:focus-within:ring-[#00A896]/20 transition-all duration-150">
            <div className="pl-3.5 pr-2.5 text-[#64748B] flex items-center justify-center pointer-events-none">
              <Lock className="size-4 text-[#002D62] dark:text-[#00A896]" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full h-11 bg-transparent pr-2 text-sm text-[#002D62] dark:text-white placeholder:text-[#94A3B8] outline-none font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="px-3.5 py-2 text-[#64748B] hover:text-[#002D62] dark:hover:text-[#00A896] transition-colors"
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & submit */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#64748B] dark:text-[#94A3B8]">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-[#CBD5E1] dark:border-[#1E3A5F] text-[#002D62] focus:ring-[#002D62]"
            />
            <span>Ingat sesi saya</span>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-[#002D62] hover:bg-[#001F44] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-[0_4px_14px_0_rgba(0,45,98,0.25)] transition-all duration-150 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin text-[#00A896]" />
              <span>Memverifikasi akun...</span>
            </>
          ) : (
            <span>Masuk ke Dashboard</span>
          )}
        </Button>
      </form>

      {/* Demo Credentials Box */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#00A896]/8 dark:bg-[#00A896]/15 border border-[#00A896]/25 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#002D62] dark:text-[#00A896]">
            <Sparkles className="size-3.5 shrink-0 text-[#00A896]" />
            <span>Kredensial Default Admin</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00A896] hover:underline shrink-0"
          >
            {copiedDemo ? (
              <>
                <Check className="size-3 text-emerald-600" />
                <span className="text-emerald-600">Terisi!</span>
              </>
            ) : (
              "Isi Otomatis"
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#334155] dark:text-[#CBD5E1]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] text-[11px]">Email:</span>
            <code className="font-mono bg-white dark:bg-[#0B192C] px-1.5 py-0.5 rounded text-[11px] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              admin@rbm.com
            </code>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] text-[11px]">Pass:</span>
            <code className="font-mono bg-white dark:bg-[#0B192C] px-1.5 py-0.5 rounded text-[11px] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              admin123
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

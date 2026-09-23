import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "cn";

export type StatColor = "primary" | "success" | "warning" | "danger" | "info" | "secondary";

interface SneatStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon: LucideIcon;
  color?: StatColor;
  className?: string;
}

const colorMap: Record<
  StatColor,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  primary: {
    bg: "bg-[#E6EDF6]",
    text: "text-[#002D62]",
    darkBg: "dark:bg-[#002D62]/40",
    darkText: "dark:text-[#00A896]",
  },
  success: {
    bg: "bg-[#E6F6F4]",
    text: "text-[#00A896]",
    darkBg: "dark:bg-[#00A896]/20",
    darkText: "dark:text-[#00C4B0]",
  },
  warning: {
    bg: "bg-[#FEF3C7]",
    text: "text-[#D97706]",
    darkBg: "dark:bg-[#F59E0B]/20",
    darkText: "dark:text-[#FBBF24]",
  },
  danger: {
    bg: "bg-[#FDE8E9]",
    text: "text-[#E63946]",
    darkBg: "dark:bg-[#E63946]/20",
    darkText: "dark:text-[#FF6B6B]",
  },
  info: {
    bg: "bg-[#E0F2FE]",
    text: "text-[#0284C7]",
    darkBg: "dark:bg-[#0284C7]/20",
    darkText: "dark:text-[#38BDF8]",
  },
  secondary: {
    bg: "bg-[#EEF2F6]",
    text: "text-[#5B6B79]",
    darkBg: "dark:bg-[#1E3A5F]/30",
    darkText: "dark:text-[#94A3B8]",
  },
};

export function SneatStatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = "primary",
  className,
}: SneatStatCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={cn(
        "rounded-xl bg-white dark:bg-[#2b2c40] p-5 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] border border-[#eceef1] dark:border-[#444564] transition-all duration-150 flex flex-col justify-between hover:translate-y-[-2px]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "size-10 rounded-lg flex items-center justify-center transition-transform",
            c.bg,
            c.text,
            c.darkBg,
            c.darkText
          )}
        >
          <Icon className="size-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-md",
              trend.isPositive
                ? "bg-[#e8fadf] text-[#71dd37]"
                : "bg-[#ffe5e0] text-[#ff3e1d]"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#a1acb8] dark:text-[#7071a4] mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold font-sans text-[#384551] dark:text-[#dbdcff]">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-[#8592a3] dark:text-[#a0abb8] mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

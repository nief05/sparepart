import * as React from "react";
import { Badge } from "@/components/ui/badge";

export type RepairStatusType =
  | "RECEIVED"
  | "DIAGNOSIS"
  | "PROGRESS"
  | "QC"
  | "READY"
  | "DELIVERED";

export function SneatStatusBadge({
  status,
  className,
}: {
  status: RepairStatusType | string;
  className?: string;
}) {
  switch (status) {
    case "RECEIVED":
      return (
        <Badge variant="info" className={className}>
          Unit Diterima
        </Badge>
      );
    case "DIAGNOSIS":
      return (
        <Badge variant="warning" className={className}>
          Diagnosis
        </Badge>
      );
    case "PROGRESS":
      return (
        <Badge variant="primary" className={className}>
          Pengerjaan
        </Badge>
      );
    case "QC":
      return (
        <Badge
          className={`bg-[#E6EDF6] text-[#002D62] dark:bg-[#002D62]/40 dark:text-[#00A896] border border-[#002D62]/20 font-semibold ${className || ""}`}
        >
          Quality Check
        </Badge>
      );
    case "READY":
      return (
        <Badge variant="success" className={className}>
          Siap Diambil
        </Badge>
      );
    case "DELIVERED":
      return (
        <Badge variant="secondary" className={className}>
          Diserahkan
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}

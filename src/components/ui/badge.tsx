import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-150 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#E6EDF6] text-[#002D62] dark:bg-[#002D62]/30 dark:text-[#00A896]",
        primary:
          "bg-[#E6EDF6] text-[#002D62] dark:bg-[#002D62]/30 dark:text-[#00A896]",
        secondary:
          "bg-[#EEF2F6] text-[#5B6B79] dark:bg-[#1E3A5F]/40 dark:text-[#94A3B8]",
        success:
          "bg-[#E6F6F4] text-[#00A896] dark:bg-[#00A896]/20 dark:text-[#00C4B0]",
        destructive:
          "bg-[#FDE8E9] text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#FF6B6B]",
        danger:
          "bg-[#FDE8E9] text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#FF6B6B]",
        warning:
          "bg-[#FEF3C7] text-[#D97706] dark:bg-[#F59E0B]/20 dark:text-[#FBBF24]",
        info:
          "bg-[#E0F2FE] text-[#0284C7] dark:bg-[#0284C7]/20 dark:text-[#38BDF8]",
        outline:
          "border border-[#E2E8F0] text-[#334155] dark:border-[#1E3A5F] dark:text-[#CBD5E1]",
        solid:
          "bg-[#002D62] text-white shadow-[0_2px_6px_0_rgba(0,45,98,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };

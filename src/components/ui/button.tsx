import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#002D62] text-white hover:bg-[#001F44] shadow-[0_2px_6px_0_rgba(0,45,98,0.25)] hover:shadow-[0_4px_10px_0_rgba(0,45,98,0.3)]",
        secondary:
          "bg-[#5B6B79] text-white hover:bg-[#4A5763] shadow-[0_2px_4px_0_rgba(91,107,121,0.3)]",
        outline:
          "border border-[#CBD5E1] text-[#002D62] bg-transparent hover:bg-[#E6EDF6] dark:border-[#1E3A5F] dark:text-[#00A896] dark:hover:bg-[#1E3A5F]",
        ghost:
          "text-[#334155] hover:bg-[#E6EDF6] hover:text-[#002D62] dark:text-[#CBD5E1] dark:hover:bg-[#1E3A5F] dark:hover:text-[#00A896]",
        destructive:
          "bg-[#E63946] text-white hover:bg-[#CC2936] shadow-[0_2px_4px_0_rgba(230,57,70,0.3)]",
        success:
          "bg-[#00A896] text-white hover:bg-[#008F80] shadow-[0_2px_6px_0_rgba(0,168,150,0.3)]",
        link: "text-[#002D62] dark:text-[#00A896] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-2 px-3.5 text-sm",
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
        lg: "h-11 gap-2.5 rounded-lg px-5 text-base font-semibold",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

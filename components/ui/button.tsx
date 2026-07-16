import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display font-bold text-sm rounded-full px-[22px] py-[13px] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-teal to-blue text-[#04141c] shadow-[0_8px_22px_rgba(45,212,191,0.22)] hover:not-disabled:-translate-y-px hover:not-disabled:brightness-110",
        ghost:
          "border border-[var(--line)] text-[var(--text)] bg-transparent hover:not-disabled:-translate-y-px",
        wa: "bg-[var(--wa)] text-[#04140b] shadow-[0_8px_22px_rgba(37,211,102,0.22)] hover:not-disabled:-translate-y-px hover:not-disabled:brightness-110",
        am: "bg-gradient-to-r from-amber to-[#f59e0b] text-[#241900] shadow-[0_8px_22px_rgba(251,191,36,0.2)] hover:not-disabled:-translate-y-px hover:not-disabled:brightness-110",
        pm: "bg-gradient-to-r from-purple to-pink text-[#1c0b2e] shadow-[0_8px_22px_rgba(167,139,250,0.22)] hover:not-disabled:-translate-y-px hover:not-disabled:brightness-110",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      block: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  block,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, block }), className)}
      {...props}
    />
  );
}

export { buttonVariants };

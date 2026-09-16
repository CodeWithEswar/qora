import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        // Mistral Saturated Orange CTA (Primary)
        default:
          "bg-primary text-primary-foreground hover:bg-[#cc3a05] active:bg-[#b03002] shadow-2xs",
        primary:
          "bg-primary text-primary-foreground hover:bg-[#cc3a05] active:bg-[#b03002] shadow-2xs",
        // Mistral Warm Cream Button
        cream:
          "bg-[#fff8e0] text-[#1f1f1f] border border-[#e6d5a8] hover:bg-[#fff0c2] active:bg-[#e6d5a8]",
        // Mistral Dark Ink Button
        dark:
          "bg-[#1f1f1f] text-white hover:bg-[#2c2c2c] active:bg-[#121212]",
        // Mistral Outlined Secondary Button
        secondary:
          "border border-[#c7c7c7] dark:border-[#3f3f46] bg-transparent text-foreground hover:bg-muted active:bg-surface-hover",
        outline:
          "border border-border bg-surface text-foreground hover:bg-surface-hover hover:border-border-strong",
        ghost:
          "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
        destructive:
          "bg-danger text-danger-foreground hover:bg-danger/90",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-9 px-4 py-2 text-sm rounded-md",
        lg: "h-11 px-5 text-sm font-medium rounded-md",
        icon: "h-8 w-8 rounded-md p-0",
        iconSm: "h-7 w-7 rounded-md p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-3.5 w-3.5 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

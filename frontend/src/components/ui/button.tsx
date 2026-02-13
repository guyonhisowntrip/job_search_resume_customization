import { Slot } from "@radix-ui/react-slot"
import { ButtonHTMLAttributes, forwardRef } from "react"

import { cn } from "@/lib/cn"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0f4c81] text-white hover:bg-[#0c3f6b] focus-visible:outline-[#0f4c81] disabled:bg-[#0f4c81]/50",
  secondary:
    "border border-[#cad2dd] bg-white text-[#10243e] hover:bg-[#f3f5f8] focus-visible:outline-[#89a6c7]",
  ghost: "text-[#274a6d] hover:bg-[#e9eef5] focus-visible:outline-[#89a6c7]",
  danger: "bg-[#b73030] text-white hover:bg-[#992525] focus-visible:outline-[#b73030]"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})

import { forwardRef, InputHTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border bg-white px-3 text-sm text-[#11273d] shadow-sm outline-none transition placeholder:text-[#6d7e91] focus:ring-2 focus:ring-[#8eb0d2]",
        hasError ? "border-[#d26a53] bg-[#fff7f4]" : "border-[#c7d3df]",
        className
      )}
      {...props}
    />
  )
})

import { forwardRef, TextareaHTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, hasError, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-xl border bg-white px-3 py-2 text-sm text-[#11273d] shadow-sm outline-none transition placeholder:text-[#6d7e91] focus:ring-2 focus:ring-[#8eb0d2]",
        hasError ? "border-[#d26a53] bg-[#fff7f4]" : "border-[#c7d3df]",
        className
      )}
      {...props}
    />
  )
})

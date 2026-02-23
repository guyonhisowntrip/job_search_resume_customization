import { HTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type BadgeTone = "neutral" | "warning" | "success"

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-[#eaf0f7] text-[#35506d]",
  warning: "bg-[#fff1e8] text-[#a64b32]",
  success: "bg-[#e6f5ef] text-[#1f6a4b]"
}

export function Badge({
  className,
  children,
  tone = "neutral"
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

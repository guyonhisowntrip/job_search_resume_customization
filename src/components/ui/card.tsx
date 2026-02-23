import { HTMLAttributes } from "react"

import { cn } from "@/lib/cn"

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#d7e1ec] bg-white/95 p-5 shadow-[0_1px_0_rgba(6,24,44,0.04),0_16px_32px_rgba(15,76,129,0.08)]",
        className
      )}
      {...props}
    />
  )
}

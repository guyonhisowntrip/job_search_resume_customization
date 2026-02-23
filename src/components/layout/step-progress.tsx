"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

import { cn } from "@/lib/cn"
import { WIZARD_STEPS, getWizardStepIndex } from "@/lib/wizard-steps"

export function StepProgress() {
  const pathname = usePathname()
  const activeIndex = getWizardStepIndex(pathname)

  if (activeIndex < 0) {
    return null
  }

  return (
    <nav aria-label="Progress" className="rounded-2xl border border-[#d7e1ec] bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
      <ol className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
        {WIZARD_STEPS.map((step, index) => {
          const isDone = index < activeIndex
          const isCurrent = index === activeIndex || (pathname.startsWith("/deploy/success") && index === WIZARD_STEPS.length - 1)

          return (
            <li key={step.id} className="flex items-center gap-2 md:flex-1">
              <Link
                href={step.href}
                className="group inline-flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7d9fc5]"
              >
                <span
                  className={cn(
                    "relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition",
                    isDone || isCurrent
                      ? "border-[#0f4c81] bg-[#0f4c81] text-white"
                      : "border-[#becddd] bg-white text-[#57708c]"
                  )}
                >
                  {isDone ? "\u2713" : index + 1}
                  {isCurrent ? (
                    <motion.span
                      layoutId="step-indicator"
                      className="absolute -inset-1 rounded-full border border-[#0f4c81]/40"
                      transition={{ type: "spring", stiffness: 280, damping: 28 }}
                    />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "truncate font-medium",
                    isCurrent ? "text-[#10243e]" : "text-[#5a718b] group-hover:text-[#2c4868]"
                  )}
                >
                  {step.label}
                </span>
              </Link>

              {index < WIZARD_STEPS.length - 1 ? (
                <span className={cn("hidden h-px flex-1 md:block", index < activeIndex ? "bg-[#0f4c81]" : "bg-[#d7e1ec]")} />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

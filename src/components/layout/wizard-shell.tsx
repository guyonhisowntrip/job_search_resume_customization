"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

import { StepProgress } from "@/components/layout/step-progress"
import { cn } from "@/lib/cn"

type WizardShellProps = {
  title: string
  description: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function WizardShell({ title, description, children, actions, className }: WizardShellProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,#dfefff_0,#f8fbff_52%,#f2f6fb_100%)]" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <StepProgress />

        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-[#0d223a] md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4f6580] md:text-base">{description}</p>
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className={cn(className)}
        >
          {children}
        </motion.section>
      </div>
    </main>
  )
}

"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useMemo, useState } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/cn"

function toBullets(rawAnalysis: string) {
  const byLine = rawAnalysis
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean)

  if (byLine.length > 1) {
    return byLine
  }

  return rawAnalysis
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

type AnalysisPanelProps = {
  analysis: string
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const bullets = useMemo(() => toBullets(analysis), [analysis])

  return (
    <Card className="p-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#f8fbff]"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="analysis-panel-content"
      >
        <div>
          <h2 className="text-base font-semibold text-[#10243e]">Analysis</h2>
          <p className="text-sm text-[#58708a]">Why your score is low or strong, and what improved it.</p>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-[#58708a] transition", isOpen ? "rotate-180" : "rotate-0")} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id="analysis-panel-content"
            key="analysis-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-[#e1e9f2]"
          >
            <div className="space-y-2 px-5 py-4">
              {bullets.length > 0 ? (
                <ul className="space-y-2 text-sm leading-6 text-[#3f5873]">
                  {bullets.map((item, index) => (
                    <li key={`${item.slice(0, 24)}-${index}`} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5f7d9d]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#5f7892]">No structured analysis was returned for this request.</p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  )
}


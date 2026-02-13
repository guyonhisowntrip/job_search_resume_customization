"use client"

import { useEffect, useMemo, useRef } from "react"
import { useInsights, type IntentType } from "./insights-context"

type IntentSection = {
  id: string
  intent: IntentType
}

const SECTION_INTENT_MAP: IntentSection[] = [
  { id: "hero", intent: "general" },
  { id: "projects", intent: "tech" },
  { id: "skills", intent: "tech" },
  { id: "experience", intent: "recruiter" },
  { id: "research", intent: "research" },
  { id: "resume", intent: "recruiter" },
]

export function IntentTracker() {
  const { setIntent } = useInsights()
  const dwellRef = useRef<Record<IntentType, number>>({
    general: 0,
    recruiter: 0,
    tech: 0,
    research: 0,
  })
  const activeIntentRef = useRef<IntentType>("general")
  const activeSectionRef = useRef<string | null>(null)

  const sections = useMemo(() => SECTION_INTENT_MAP, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const interval = window.setInterval(() => {
      const activeIntent = activeIntentRef.current
      dwellRef.current[activeIntent] += 1
      const weightedIntent = pickIntent(dwellRef.current)
      setIntent(weightedIntent)
    }, 1500)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = sections.find((item) => item.id === entry.target.id)
            if (section) {
              activeIntentRef.current = section.intent
              activeSectionRef.current = section.id
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    const onScroll = () => {
      const scrollDepth = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1)
      if (scrollDepth > 0.7 && activeSectionRef.current !== "experience") {
        dwellRef.current.recruiter += 1
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.clearInterval(interval)
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [sections, setIntent])

  return null
}

function pickIntent(dwell: Record<IntentType, number>): IntentType {
  const entries = Object.entries(dwell) as [IntentType, number][]
  entries.sort((a, b) => b[1] - a[1])
  return entries[0]?.[0] ?? "general"
}

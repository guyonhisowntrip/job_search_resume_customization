"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePortfolio } from "../portfolio-context"

export type IntentType = "general" | "recruiter" | "tech" | "research"

type InsightsState = {
  projectCounts: Record<string, number>
  skillCounts: Record<string, number>
}

type InsightsContextValue = {
  intent: IntentType
  setIntent: (intent: IntentType) => void
  recordSources: (sources: { id: string; type: string }[]) => void
  mostAskedProject?: string
  mostAskedSkill?: string
}

const InsightsContext = createContext<InsightsContextValue | null>(null)

const STORAGE_KEY = "portfolio:session-insights"

function getDefaultState(): InsightsState {
  return { projectCounts: {}, skillCounts: {} }
}

export function InsightsProvider({ children }: { children: React.ReactNode }) {
  const portfolio = usePortfolio()
  const [intent, setIntent] = useState<IntentType>("general")
  const [state, setState] = useState<InsightsState>(getDefaultState)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setState(JSON.parse(stored) as InsightsState)
      } catch {
        setState(getDefaultState())
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const recordSources = useCallback((sources: { id: string; type: string }[]) => {
    setState((prev) => {
      const next = { ...prev, projectCounts: { ...prev.projectCounts }, skillCounts: { ...prev.skillCounts } }
      sources.forEach((source) => {
        if (source.type === "project") {
          next.projectCounts[source.id] = (next.projectCounts[source.id] ?? 0) + 1
        }
        if (source.type === "skill") {
          next.skillCounts[source.id] = (next.skillCounts[source.id] ?? 0) + 1
        }
      })
      return next
    })
  }, [])

  const mostAskedProject = useMemo(() => {
    const entries = Object.entries(state.projectCounts)
    if (!entries.length) return undefined
    const [id] = entries.sort((a, b) => b[1] - a[1])[0]
    const project = portfolio.projects.find((item) => item.id === id)
    return project?.title
  }, [state.projectCounts])

  const mostAskedSkill = useMemo(() => {
    const entries = Object.entries(state.skillCounts)
    if (!entries.length) return undefined
    const [id] = entries.sort((a, b) => b[1] - a[1])[0]
    const skill = portfolio.skills.find((item) => item.id === id)
    return skill?.name
  }, [state.skillCounts])

  const value = useMemo(
    () => ({ intent, setIntent, recordSources, mostAskedProject, mostAskedSkill }),
    [intent, recordSources, mostAskedProject, mostAskedSkill]
  )

  return <InsightsContext.Provider value={value}>{children}</InsightsContext.Provider>
}

export function useInsights() {
  const context = useContext(InsightsContext)
  if (!context) {
    throw new Error("useInsights must be used within InsightsProvider")
  }
  return context
}

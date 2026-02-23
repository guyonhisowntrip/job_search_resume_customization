"use client"

import React, { createContext, useContext, useMemo } from "react"
import type { ResumeData } from "./resume-schema"
import { mapResumeToPortfolio, type PortfolioData } from "./adapter"

const PortfolioContext = createContext<PortfolioData | null>(null)

export function PortfolioProvider({ resumeData, children }: { resumeData: ResumeData; children: React.ReactNode }) {
  const value = useMemo(() => mapResumeToPortfolio(resumeData), [resumeData])
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) throw new Error("usePortfolio must be used within PortfolioProvider")
  return context
}

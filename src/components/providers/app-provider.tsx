"use client"

import { WizardProvider } from "@/context/wizard-context"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <WizardProvider>{children}</WizardProvider>
}

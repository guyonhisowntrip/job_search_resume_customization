"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import { inferConfidenceMap } from "@/lib/confidence"
import { ResumeData, emptyResumeData } from "@/lib/resume-schema"
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates"
import { persistWizardState, readPersistedWizardState } from "@/lib/storage"
import { validateResumeForDeployment } from "@/lib/validation"

type SaveStatus = "idle" | "saving" | "saved" | "error"

type WizardContextValue = {
  hydrated: boolean
  resumeData: ResumeData
  setResumeData: (value: ResumeData) => void
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void
  selectedTemplate: string
  setSelectedTemplate: (value: string) => void
  username: string
  setUsername: (value: string) => void
  confidenceMap: Record<string, { score: number; reason: string }>
  validation: ReturnType<typeof validateResumeForDeployment>
  saveStatus: SaveStatus
  lastSavedAt: number | null
  resetResumeData: () => void
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData)
  const [selectedTemplate, setSelectedTemplate] = useState<string>(DEFAULT_TEMPLATE_ID)
  const [username, setUsername] = useState("")
  const [hydrated, setHydrated] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const skipFirstAutosave = useRef(true)

  useEffect(() => {
    const persisted = readPersistedWizardState()
    setResumeData(persisted.resumeData)
    setSelectedTemplate(persisted.selectedTemplate || DEFAULT_TEMPLATE_ID)
    setUsername(persisted.username)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (skipFirstAutosave.current) {
      skipFirstAutosave.current = false
      return
    }

    setSaveStatus("saving")
    const timeout = window.setTimeout(() => {
      try {
        persistWizardState({ resumeData, selectedTemplate, username })
        setLastSavedAt(Date.now())
        setSaveStatus("saved")
      } catch {
        setSaveStatus("error")
      }
    }, 550)

    return () => window.clearTimeout(timeout)
  }, [hydrated, resumeData, selectedTemplate, username])

  const updateResumeData = useCallback((updater: (prev: ResumeData) => ResumeData) => {
    setResumeData((prev) => updater(prev))
  }, [])

  const resetResumeData = useCallback(() => {
    setResumeData(emptyResumeData)
  }, [])

  const confidenceMap = useMemo(() => inferConfidenceMap(resumeData), [resumeData])
  const validation = useMemo(() => validateResumeForDeployment(resumeData), [resumeData])

  const value = useMemo<WizardContextValue>(() => {
    return {
      hydrated,
      resumeData,
      setResumeData,
      updateResumeData,
      selectedTemplate,
      setSelectedTemplate,
      username,
      setUsername,
      confidenceMap,
      validation,
      saveStatus,
      lastSavedAt,
      resetResumeData
    }
  }, [
    hydrated,
    resumeData,
    updateResumeData,
    selectedTemplate,
    username,
    confidenceMap,
    validation,
    saveStatus,
    lastSavedAt,
    resetResumeData
  ])

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const context = useContext(WizardContext)

  if (!context) {
    throw new Error("useWizard must be used inside WizardProvider")
  }

  return context
}

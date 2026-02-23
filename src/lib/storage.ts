import { DEFAULT_TEMPLATE_ID } from "@/lib/templates"
import { ResumeData, emptyResumeData, normalizeResumeData } from "@/lib/resume-schema"

export const STORAGE_KEYS = {
  resumeData: "resumeData",
  selectedTemplate: "selectedTemplate",
  username: "username"
} as const

export type PersistedWizardState = {
  resumeData: ResumeData
  selectedTemplate: string
  username: string
}

export function readPersistedWizardState(): PersistedWizardState {
  if (typeof window === "undefined") {
    return {
      resumeData: emptyResumeData,
      selectedTemplate: DEFAULT_TEMPLATE_ID,
      username: ""
    }
  }

  try {
    const resumeDataRaw = window.localStorage.getItem(STORAGE_KEYS.resumeData)
    const selectedTemplate = window.localStorage.getItem(STORAGE_KEYS.selectedTemplate) ?? DEFAULT_TEMPLATE_ID
    const username = window.localStorage.getItem(STORAGE_KEYS.username) ?? ""

    return {
      resumeData: resumeDataRaw ? normalizeResumeData(JSON.parse(resumeDataRaw)) : emptyResumeData,
      selectedTemplate,
      username
    }
  } catch {
    return {
      resumeData: emptyResumeData,
      selectedTemplate: DEFAULT_TEMPLATE_ID,
      username: ""
    }
  }
}

export function persistWizardState(state: PersistedWizardState) {
  window.localStorage.setItem(STORAGE_KEYS.resumeData, JSON.stringify(state.resumeData))
  window.localStorage.setItem(STORAGE_KEYS.selectedTemplate, state.selectedTemplate)
  window.localStorage.setItem(STORAGE_KEYS.username, state.username)
}

export type WizardStepId = "upload" | "edit" | "templates" | "preview" | "deploy"

export type WizardStep = {
  id: WizardStepId
  label: string
  href: string
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "upload", label: "Upload", href: "/upload" },
  { id: "edit", label: "Edit", href: "/edit" },
  { id: "templates", label: "Template", href: "/templates" },
  { id: "preview", label: "Preview", href: "/preview" },
  { id: "deploy", label: "Deploy", href: "/deploy" }
]

export function getWizardStepIndex(pathname: string): number {
  const directIndex = WIZARD_STEPS.findIndex((step) => pathname === step.href)

  if (directIndex !== -1) {
    return directIndex
  }

  if (pathname.startsWith("/deploy/success")) {
    return WIZARD_STEPS.length
  }

  return -1
}
